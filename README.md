# Mapping the Catalan vote with D3 cartograms

In January 2018 <a href="https://vicoliveres.github.io/mapping-catalan-elections-d3-cartogram/">I published this data analysis of the 2017 Catalan elections outcome in relation to population</a>. 
It's part of my work in the MA Data Journalism at Birmingham City University.

<b>Cartogram: Winner party per Catalan county</b>
![Cartogram: Winner party per Catalan county](https://github.com/vicoliveres/mapping-catalan-elections-d3-cartogram/blob/master/catalonia-comarques-cartogram.png)

<b>Cartogram: Winner party per Catalan municipality</b>
![Cartogram: Winner party per Catalan municipality](https://github.com/vicoliveres/mapping-catalan-elections-d3-cartogram/blob/master/catalonia-municipis-cartogram.png)

<b>Cartograms: Percentage vote per each three winning parties, per Catalan county</b>
![Cartograms: Percentage vote per each three winning parties per Catalan county](https://github.com/vicoliveres/mapping-catalan-elections-d3-cartogram/blob/master/catalonia-percentatge-cartogram.png)

<b>Cartograms: Difference between pro-independence and pro-union parties and change since the last election, per Catalan county</b>
![artograms: Difference between pro-independence and pro-union parties and change since the last election, per Catalan county](https://github.com/vicoliveres/mapping-catalan-elections-d3-cartogram/blob/master/catalonia-independence-union-cartogram.png)

## About the cartograms

To merge election results with other variables I made <b>cartograms</b>, <a href="https://www2.cs.arizona.edu/~kobourov/star.pdf">combinations of statistical and geographical information in thematic maps</a>. 

I used D3 and adapted the code from the following:
<ul>
  <li><a href="https://bl.ocks.org/martgnz/34880f7320eb5a6745e2ed7de7914223">Catalan comarques cartogram, by Martin Gonzalez</a>.</li>
  <li><a href="http://bl.ocks.org/d3noob/a22c42db65eb00d4e369">Tooltips, by d3noob</a>.</li>
  <li><a href="https://bost.ocks.org/mike/map/">Let’s Make a Map, by Mike Bostock</a>.</li>
</ul>  

## Get the data

I needed 3 types of data for my visualisations:

<ul>
 <li>Geographycal:
    <ul>
      <li><a href="http://www.icgc.cat/Administracio-i-empresa/Descarregues/Capes-de-geoinformacio/Base-municipal">Administration boundaries SHP files at county and municipality level, from the Catalan Cartographic Institute (ICGC)</a>.</li>
      <li>Convert the downloaded files of the chosen level to TopoJSON with <a href="http://mapshaper.org/">Mapshaper</a> and you will get a <a href="https://github.com/vicoliveres/mapping-catalan-elections-d3-cartogram/blob/master/docs/municipis.json">Catalan municipalities (municipis) JSON</a> or <a href="https://github.com/vicoliveres/mapping-catalan-elections-d3-cartogram/blob/master/docs/comarques.json">Catalan Counties (comarques) JSON</a>.</li>
    </ul></li> 
 <li>Statistical:
    <ul>
      <li><a href="http://www.idescat.cat/pub/?id=aec&n=246">Population from the Statistical Institute of Catalonia (Idescat)</a>.</li>
    </ul></li> 
<li>Election results:
  <ul>
   <li><a href="https://resultats.parlament2017.cat/09mesas/09-mun.csv.zip">21 December 2017, from the Government of Catalonia</a>.</li> 
   <li><a href="http://www.gencat.cat/governacio/resultatsparlament2015/resu/09mesas/ELECCIONS_PARLAMENT_CATALUNYA_2015.zip">27 September 2015, from the Government of Catalonia</a>.</li>
 </ul></li> 
</ul> 

## Data analysis

After matching the data, I put together the population data with the percentage vote of each of the seven parliamentary parties, both at municipality and county level. 

I also calculated the difference between pro-independence and pro-union vote, and the change of it since the last election.

  <ul>
    <li><a href="https://github.com/vicoliveres/mapping-catalan-elections-d3-cartogram/blob/master/docs/data-pop-winner.csv">CSV: Results and population per county</a>.</li>
    <li><a href="https://github.com/vicoliveres/mapping-catalan-elections-d3-cartogram/blob/master/docs/data-popmun-winner.csv">CSV: Results and population per municipality</a>.</li>
  </ul>

## Get the code

As I published the article in Github Pages, all the code is open and can be find in the <a href="https://github.com/vicoliveres/mapping-catalan-elections-d3-cartogram/tree/master/docs">/docs folder of this repo</a>.

  <ul>
    <li><a href="https://github.com/vicoliveres/mapping-catalan-elections-d3-cartogram/blob/master/docs/index.html">HTML</a>.</li>
  <li><a href="https://github.com/vicoliveres/mapping-catalan-elections-d3-cartogram/blob/master/docs/style.css">CSS</a>, with typography and navigation features from <a href="http://getskeleton.com/">Skeleton</a> (<a href="https://github.com/dhg/Skeleton/blob/master/LICENSE.md">Copyright (c) 2011-2014 Dave Gamache</a>).</li>
  <li><a href="https://github.com/vicoliveres/mapping-catalan-elections-d3-cartogram/blob/master/docs/map-com-pop-partits.js">Javascript, where D3 code is writen.</a>.</li>
  </ul>
