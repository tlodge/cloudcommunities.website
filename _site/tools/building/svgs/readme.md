This folder creates json objects from a inkscape svg file.  Note that at the moment the translate python function simply normalises an svg file by finding the min and max x and y coords and updating x and y values of rects to translate them to have the top left most object appear in the top left corner of the browser window.  It doesn't deal with matrix or translate transformations - but it will apply a scale transform that is applied directly to a rect eg:

<rect
y="-630.53314"
x="15.910686"
height="4.9356766"
width="23.646902"
id="rect5372"
transform="scale(1,-1)" />

In order to get rid of all other transforms in inkscape, you first need to ungroup everything, then move and resize as appropriate and then regroup as required. This is a pain if your groups have specific labels as you'll need to relabel again afterwards.  Otherwise rather than absolute coordinates you get a bunch of partent groups with top level transformations (matrix, scale or translate).  Eventually it ought to be reasonably easy to apply transformations through a script to reduce the fiddliness of creating svgs in inkscape, but manual is fine for now. 