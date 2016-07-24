Pipeline:

1.
DAC_Entire_DataBase.json, papers.csv, citations_links.csv
-> extraction.ipynb 
= Paper_2014_clean.json, dac_abstract.txt

2.
dac_abstract.txt
-> TopMine (in java)
= corpus.txt

3.
corpus.txt, Paper_2014_clean.json
-> extraction2.ipynb
= super_data.json

4.
super_data.json
-> influence.ipynb
= super_data_2.json

5.
super_data_2.json
->propagation_auto.ipynb
= super_data_3.json

6.
super_data_3.json
->size_reduction_for_web.ipynb
= super_data_4.json

7.
super_data_4.json
->index.html, graph.js
= visulization & website 