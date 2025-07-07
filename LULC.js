var s2=ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
Map.addLayer(ROI)
Map.centerObject(ROI,10)

var filtered=s2.filter(ee.Filter.bounds(ROI))
               .filter(ee.Filter.date('2024-05-29','2024-12-31'))
               .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',1))
               .select('B.*')
               
var before= filtered.median().clip(ROI)
Map.addLayer(before,imageVisParam,'before')


var after = s2.filter(ee.Filter.bounds(ROI))
               .filter(ee.Filter.date('2025-01-1','2025-5-30'))
               .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',1))
               .select('B.*')
               .median()
               .clip(ROI)

Map.addLayer(after,imageVisParam2,'after')

var training = Urban.merge(Baren).merge(Water).merge(vegetation)

var training = before.sampleRegions({
  collection: training,
  properties: ['Class'],
  scale: 10})
  
print(training)

var classifier= ee.Classifier.smileRandomForest(40).train({
  features:training,
  classProperty:'[Class]',
  inputProperties: before.bandNames()
})

var beforeClassified= before.classify(classifier)
Map.addLayer(beforeClassified, {min:0, max:4,palete:['red','brown','blue','green']}),'beforeClassified'
