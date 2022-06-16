
var s2VisParams = {
  "bands":["B4","B3","B2"],
  "min":0,
  "max":3000
};

var geometry = ee.Geometry.MultiPoint();

//Loads Sentinel-2 images
var s2 = ee.ImageCollection('COPERNICUS/S2_HARMONIZED')
             .filterDate(startDate, endDate)
             .filterBounds(geometry)
             .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 35));
             
var s2Image = ee.Image(s2.first());

Map.addLayer(s2Image, s2VisParams, 'Sentinel-2 Image');
Map.centerObject(geometry, 13);


var imageId = s2Image.get('system:index');

var dw = ee.ImageCollection('GOOGLE/DYNAMICWORLD/V1')
             .filter(ee.Filter.eq('system:index', imageId));
var dwImage = ee.Image(dw.first());


//Creating landuse
var counties = ee.FeatureCollection('TIGER/2016/Counties');
var filtered = counties.filter(ee.Filter.eq('NAMELSAD', 'Hoke County'));
var geometry = filtered.geometry();
Map.centerObject(geometry, 10);

var classification = dw.select('label');
var dwComposite = classification.reduce(ee.Reducer.mode());

var classification = dwImage.select('label');
var dwVisParams = {
  min: 0,
  max: 8,
  palette: [
    '#419BDF', '#397D49', '#88B053', '#7A87C6', '#E49635', '#DFC35A',
    '#C4281B', '#A59B8F', '#B39FE1'
  ]
};

Map.addLayer(dwComposite.clip(geometry), dwVisParams, 'Classified Composite');

//Creating Hillsahde
var probabilityBands = [
  'water', 'trees', 'grass', 'flooded_vegetation', 'crops', 'shrub_and_scrub',
  'built', 'bare', 'snow_and_ice'
];

