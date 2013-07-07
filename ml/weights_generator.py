import re
import string
import sys

def build_weights(whitelist_name, blacklist_name):
  result = {}
  with open(whitelist_name) as whitelist:
    for line in whitelist:
      cleaned = strip(line)
      if(cleaned):
        result[cleaned] = 0
  
  with open(blacklist_name) as blacklist:
    for line in blacklist:
      cleaned = strip(line)
      if(cleaned and not cleaned in result):
        result[cleaned] = 10.0
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
  build_weights(sys.argv[1], sys.argv[2])
