#!/bin/bash
python grey_list_generator.py > greylist.txt
rm uncensored.txt
rm censored.txt
python weights_generator.py > weights.txt
