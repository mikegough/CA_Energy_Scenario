import os
import math
from collections import deque, namedtuple

import geojson
import mercantile
import six
from PIL import Image
from requests_futures.sessions import FuturesSession
from shapely import geos, wkt


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
    return geojson.Feature(geometry=geom, properties={}).geometry


def get_bbox(s):
    p = wkt.loads(s)
    return p.bounds


class Basemap:

    def __init__(self, extent, url, zoom=None, srid=4326, subdomains=['a', 'b', 'c'],
                 max_output_width=500, max_output_height=0, output_file='map.png'):
        """
        :param extent: [xmin, ymin, xmax, ymax]
        :param srid: is not used right now
        :param zoom: int
        :param url: must be a full url, including access_token (if needed), and placeholders for x, y, x, and
            subdomains (if relevant). e.g.: http://{s}.tile.osm.org/{z}/{x}/{y}.png
        :param subdomains: a list of subdomains.
            see: https://github.com/Leaflet/Leaflet/blob/master/src/layer/tile/TileLayer.js#L24
        :param max_output_width:
        """
        self.url = url
        self.url_gets_subdomain = url.__contains__('s') and subdomains
        self.subdomains = deque(subdomains)
        self.max_output_width = float(max_output_width)
        self.max_output_height = float(max_output_height)
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

        xmin, ymin, xmax, ymax = map(float, extent)

        x_diff = xmax - xmin
        y_diff = ymax - ymin
        extent_aspect_ratio = 1 if x_diff == 0 else y_diff / x_diff

        if self.max_output_height:
            img_aspect_ratio = self.max_output_height / self.max_output_width
        else:
            img_aspect_ratio = extent_aspect_ratio
            self.max_output_height = img_aspect_ratio * self.max_output_width

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
        return math.sqrt((x_diff * y_diff) / (self.max_output_width * self.max_output_height))

    def _get_zoom(self):
        resolution = self._get_resolution()
        z = math.floor(math.log(360 / (resolution * TILE_WIDTH), 2))
        new_resolution = 360 / (TILE_WIDTH * 2**z)  # calculated z is rounded down, so resolution and extent must be updated
        self._update_extent(new_resolution)
        return z

    def _update_extent(self, resolution):
        x_diff = (resolution * self.max_output_width) - (self.extent.xmax - self.extent.xmin)
        y_diff = (resolution * self.max_output_height) - (self.extent.ymax - self.extent.ymin)
        new_xmin = self.extent.xmin - (x_diff / 2.0)
        new_ymin = self.extent.ymin - (y_diff / 2.0)
        new_xmax = self.extent.xmax + (x_diff / 2.0)
        new_ymax = self.extent.ymax + (y_diff / 2.0)

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

    def _fix_zoom(self):
        # FIXME
        x = self.grid_corners.ll.x
        y = self.grid_corners.ur.y
        z = 0.5 * (-((x**2 + y**2 - 2 * x * y + 400) ** 0.5) + x + y)
        self.zoom = math.floor(math.log(z, 2))

    def _init_map(self):
        #self.tile_width, self.tile_height = img_size
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
            f = Image.open(six.BytesIO(resp.content))
        else:
            f = self.empty_tile
        self.map.paste(f, (pos_in_grid[0] * self.tile_height, pos_in_grid[1] * self.tile_width))
        self.map.save(self.output_file)

    def _get_crop_box(self):
        ul = mercantile.bounds(self.grid_corners.ll.x, self.grid_corners.ur.y, self.zoom)
        lr = mercantile.bounds(self.grid_corners.ur.x, self.grid_corners.ll.y, self.zoom)

        map_ul_x, map_ul_y = mercantile.xy(ul.west, ul.north)
        map_lr_x, map_lr_y = mercantile.xy(lr.east, lr.south)

        w_ratio = self.map_width / (map_lr_x - map_ul_x)
        h_ratio = self.map_height / (map_ul_y - map_lr_y)

        ex_ul_x, ex_ul_y = mercantile.xy(self.extent.xmin, self.extent.ymax)
        ex_lr_x, ex_lr_y = mercantile.xy(self.extent.xmax, self.extent.ymin)

        return (
            w_ratio * (ex_ul_x - map_ul_x),
            h_ratio * (map_ul_y - ex_ul_y),
            self.map_width - w_ratio * (map_lr_x - ex_lr_x),
            self.map_height - h_ratio * (ex_lr_y - map_lr_y)
        )

    def crop(self):
        crop_box = self._get_crop_box()
        self.map = self.map.crop(crop_box)

    def render(self):
        self.fetch()
        self.crop()
        self.map.save(self.output_file)
        self.map.close()
