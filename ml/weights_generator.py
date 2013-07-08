#!/usr/bin/python
import re
import string
import sys

def build_weights(whitelist_name, blacklist_name, greylist_name):
  result = {}
  with open(whitelist_name) as whitelist:
    for line in whitelist:
      cleaned = strip(line)
      if(cleaned):
        result[cleaned] = 0
  
  with open(blacklist_name) as blacklist:
    for line in blacklist:
      cleaned = strip(line)
      if cleaned and not (cleaned in result):
        result[cleaned] = 10.0
  with open(greylist_name) as greylist:
    for line in greylist:
      word, weight, frequency = line.split(',') 
      cleaned = word
      if cleaned and not (cleaned in result):
        result[cleaned] = weight

  format(result)
  return None

def format(result_hash):
  for word, weight in result_hash.items():
    print "%s,%s" % ( str(word), str(weight ))

def strip(word):
  regex = re.compile('[%s]' % re.escape(string.punctuation)) 
  if re.search(regex, word):
    return None
  return word.strip().lower()

if __name__ == '__main__':
  white, black, grey = ("whitelist.txt", "blacklist.txt", "greylist.txt")
  if len(sys.argv) > 2:
    white = sys.argv[1]
  if len(sys.argv) > 3:
    black = sys.argv[2]
  if len(sys.argv) > 4:
    grey = sys.argv[3]
  build_weights(white, black, grey)
