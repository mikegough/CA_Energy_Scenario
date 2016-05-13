import math
import os
from collections import deque, namedtuple

import geojson
import mapnik
import mercantile
from PIL import Image
from requests_futures.sessions import FuturesSession
from shapely import geos, wkt
from six import BytesIO

MAX_TILES = 100
EMPTY_TILE = os.path.join(os.path.dirname(__file__), 'empty_tile.png')
TILE_WIDTH = 256
CornerTiles = namedtuple('GridCorners', ['ll', 'ur'])
Extent = namedtuple('Extent', ['xmin', 'ymin', 'xmax', 'ymax', 'srid'])
GridSize = namedtuple('GridSize', ['rows', 'columns', 'total'])


def wkt_to_geojson(s):
    s = s[s.find(';')+1:]     # removes SRID=xxxx, because Shapely does not support EWKT!
    try:
        geom = wkt.loads(s)
    except geos.ReadingError:
        raise Exception('Bad wkt')
    return geojson.Feature(geometry=geom, properties={})


def get_bbox(s):
    p = wkt.loads(s)
    return p.bounds


def xy_to_lnglat(x, y):
    lng = math.degrees(x / 6378137.0)
    lat = math.degrees(2 * (math.atan(math.pow(math.e, (y / 6378137.0))) - (math.pi * 0.25)))
    return lng, lat


def get_image_size(basemap):
    f = Image.open(basemap)
    width, height = f.size
    f.close()
    return width, height


class Basemap:

    def __init__(self, extent, url, zoom=None, srid=4326, subdomains=['a', 'b', 'c'],
                 width=500, height=None, h_error_ratio=1.22, output_file=''):
        """
        :param extent: [xmin, ymin, xmax, ymax]
        :param srid: is not used right now
        :param zoom: int
        :param url: must be a full url, including access_token (if needed), and placeholders for x, y, x, and
            subdomains (if relevant). e.g.: http://{s}.tile.osm.org/{z}/{x}/{y}.png
        :param subdomains: a list of subdomains.
            see: https://github.com/Leaflet/Leaflet/blob/master/src/layer/tile/TileLayer.js#L24
        :param width:
        :param height:
        :param h_error_ratio: fixes height for DCREP area
        """
        self.url = url
        self.url_gets_subdomain = url.__contains__('s') and subdomains
        self.subdomains = deque(subdomains)

        self.width = float(width)
        if height:
            self.height = float(height) / h_error_ratio
        else:
            self.height = 0.0

        self.output_file = output_file

        self.extent = self._set_extent(extent, srid)
        self.zoom = zoom or self._get_zoom()
        self.empty_tile = Image.open(EMPTY_TILE)
        self.tile_width = self.tile_height = TILE_WIDTH

        self.session = FuturesSession()

        self._init_grid()
        self._init_map()

        if self.grid_size.total > MAX_TILES:
            raise ValueError(
                'Too many tiles ({total_tiles})\nChange extent or zoom level'.format(total_tiles=self.grid_size.total))

    def bound_xs(self, xmin, xmax):
        xmin_comp = xmax_comp = 0
        if xmin < -180:
            xmax_comp = -180 - xmin
        if xmax > 180:
            xmin_comp = xmax - 180

        if xmin - xmin_comp < -180:
            xmin = -180
        else:
            xmin -= xmin_comp

        if xmax + xmax_comp > 180:
            xmax = 180
        else:
            xmax += xmax_comp

        return xmin, xmax

    def bound_ys(self, ymin, ymax):
        ymin_comp = ymax_comp = 0
        if ymin < -90:
            ymax_comp = -90 - ymin
        if ymax > 90:
            ymin_comp = ymax - 90

        if ymin - ymin_comp < -90:
            ymin = -90
        else:
            ymin -= ymin_comp

        if ymax + ymax_comp > 90:
            ymax = 90
        else:
            ymax += ymax_comp

        return ymin, ymax

    def _set_extent(self, extent, srid):
        """Expand self as necessary to fit dimensions of image (code from Databasin)
        """

        xmin, ymin, xmax, ymax = map(lambda c: round(float(c), 9), extent)

        x_diff = xmax - xmin
        y_diff = ymax - ymin
        extent_aspect_ratio = 1 if x_diff == 0 else y_diff / x_diff

        self.width_for_given_extent = self.width

        if self.height:
            img_aspect_ratio = self.height / self.width
        else:
            img_aspect_ratio = extent_aspect_ratio
            self.height = img_aspect_ratio * self.width

        if img_aspect_ratio > extent_aspect_ratio:
            # img is taller than extent
            diff_extent_units = ((img_aspect_ratio * x_diff) - y_diff) / 2.0
            ymin -= diff_extent_units
            ymax += diff_extent_units
        elif img_aspect_ratio < extent_aspect_ratio:
            # img is wider than extent
            diff_extent_units = ((y_diff / img_aspect_ratio) - x_diff) / 2.0
            xmin -= diff_extent_units
            xmax += diff_extent_units

        xmin, xmax = self.bound_xs(xmin, xmax)
        ymin, ymax = self.bound_ys(ymin, ymax)

        return Extent(xmin, ymin, xmax, ymax, srid)

    def _get_resolution(self):
        x_diff = self.extent.xmax - self.extent.xmin
        y_diff = self.extent.ymax - self.extent.ymin
        return math.sqrt((x_diff * y_diff) / (self.width * self.height))

    def _get_zoom(self):
        resolution = self._get_resolution()
        z = math.floor(math.log(360 / (resolution * TILE_WIDTH), 2))
        new_resolution = 360 / (TILE_WIDTH * 2**z)  # calculated z is rounded down, so resolution and extent must be updated
        self._update_extent(new_resolution)
        return z

    def _update_extent(self, resolution):
        x_diff = (resolution * self.width) - (self.extent.xmax - self.extent.xmin)
        y_diff = (resolution * self.height) - (self.extent.ymax - self.extent.ymin)
        new_xmin = round(self.extent.xmin - (x_diff / 2.0), 9)
        new_ymin = round(self.extent.ymin - (y_diff / 2.0), 9)
        new_xmax = round(self.extent.xmax + (x_diff / 2.0), 9)
        new_ymax = round(self.extent.ymax + (y_diff / 2.0), 9)

        new_xmin, new_xmax = self.bound_xs(new_xmin, new_xmax)
        new_ymin, new_ymax = self.bound_ys(new_ymin, new_ymax)

        self.extent = Extent(new_xmin, new_ymin, new_xmax, new_ymax, self.extent.srid)

    def _grid_corners(self):
        ll = mercantile.tile(self.extent.xmin, self.extent.ymin, self.zoom)
        ur = mercantile.tile(self.extent.xmax, self.extent.ymax, self.zoom)
        return CornerTiles(ll, ur)

    def _grid_size(self):
        c = min(self.grid_corners.ur.x + 1, 2 ** self.zoom) - self.grid_corners.ll.x
        r = min(self.grid_corners.ll.y + 1, 2 ** self.zoom) - self.grid_corners.ur.y
        return GridSize(r, c, r*c)

    def _init_grid(self):
        self.grid_corners = self._grid_corners()
        self.grid_size = self._grid_size()

    def _init_map(self):
        self.map_height = self.tile_height * self.grid_size.rows
        self.map_width = self.tile_height * self.grid_size.columns
        self.map = Image.new('RGB', [self.map_width, self.map_height])

    def _get_subdomain(self):
        if self.url_gets_subdomain:
            self.subdomains.rotate()
            return self.subdomains[0]
        return ''

    def fetch(self):
        tiles = mercantile.tiles(self.extent.xmin, self.extent.ymin, self.extent.xmax, self.extent.ymax, [self.zoom])
        futures = []

        print('{} tiles to fetch...'.format(self.grid_size.total))
        for idx, tile in enumerate(tiles):
            url = self.url.format(s=self._get_subdomain(), x=int(tile.x), y=int(tile.y), z=int(tile.z))
            pos_in_grid = (int(math.floor(idx / self.grid_size.rows)), int(idx % self.grid_size.rows))
            callback = lambda sess, resp, pos_in_grid=pos_in_grid: self.stitch(sess, resp, pos_in_grid)
            futures.append(self.session.get(url, background_callback=callback))
            print('Tile #{} of {}'.format(idx + 1, self.grid_size.total))
        for f in futures:
            f.result()

    def stitch(self, sess, resp, pos_in_grid):
        if resp.status_code == 200:
            f = Image.open(BytesIO(resp.content))
        else:
            f = self.empty_tile
        self.map.paste(f, (pos_in_grid[0] * self.tile_height, pos_in_grid[1] * self.tile_width))

    def _get_crop_box(self):
        ul = mercantile.bounds(self.grid_corners.ll.x, self.grid_corners.ur.y, self.zoom)
        lr = mercantile.bounds(self.grid_corners.ur.x, self.grid_corners.ll.y, self.zoom)

        map_ul_x, map_ul_y = mercantile.xy(ul.west, ul.north)
        map_lr_x, map_lr_y = mercantile.xy(lr.east, lr.south)

        w_ratio = self.map_width / (map_lr_x - map_ul_x)
        h_ratio = self.map_height / (map_ul_y - map_lr_y)

        ex_ul_x, ex_ul_y = mercantile.xy(self.extent.xmin, self.extent.ymax)
        ex_lr_x, ex_lr_y = mercantile.xy(self.extent.xmax, self.extent.ymin)

        x0 = w_ratio * (ex_ul_x - map_ul_x)
        y0 = h_ratio * (map_ul_y - ex_ul_y)
        x1 = self.map_width - w_ratio * (map_lr_x - ex_lr_x)
        y1 = self.map_height - h_ratio * (ex_lr_y - map_lr_y)

        return x0, y0, x1, y1

    def crop(self):
        crop_box = self._get_crop_box()
        self.map = self.map.crop(crop_box)

    def render(self):
        self.fetch()
        self.crop()

        # FIXME the final height is different from what we want due to projection errors. An error ratio is returned for monkey-patching, but calculations must be fixed.
        final_height = self.map.height

        output_file, output_extension = os.path.splitext(self.output_file)
        output_extension = output_extension[output_extension.find('.') + 1:] or 'PNG'

        if output_file:
            self.map.save(output_file + '.' + output_extension)
            self.map.close()
            return output_file + '.' + output_extension, self.extent, (final_height / self.height)
        else:
            output_file = BytesIO()
            self.map.save(output_file, output_extension)
            self.map.close()
            b = output_file.getvalue()
            output_file.close()
            return b, self.extent, (final_height / self.height)


class Mapnik:

    def __init__(self, width, height, extent, prop_file, ):
        self.map = mapnik.Map(width, height)
        self.map.aspect_fix_mode = mapnik.aspect_fix_mode.RESPECT

        mapnik.load_map(self.map, prop_file)

        box = mapnik.Box2d(*extent)
        self.map.zoom_to_box(box)

    def render_to_file(self, output_file):
        mapnik.render_to_file(self.map, output_file)

    def render_to_byte(self):
        im = mapnik.Image(self.map.width, self.map.height)
        mapnik.render(self.map, im)
        return im.tostring('png256')
