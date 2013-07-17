import re, string

blackListFile = open("blacklist.txt", "r")
censoredListFile = open("censored.txt", "r+")
whiteListFile = open("whitelist.txt", "r")
uncensoredListFile = open("uncensored.txt", "r+")
greyListFile = open("greylist.txt", "r+")

blackListing = blackListFile.read()
censoredListing = censoredListFile.read()
whiteListing = whiteListFile.read()
uncensoredListing = uncensoredListFile.read()
greyListing = greyListFile.read()

censoredListing = censoredListing.replace(' ', '\n')
uncensoredListing = uncensoredListing.replace(' ', '\n')

censoredListing = re.sub('[%s]' % re.escape(string.punctuation), '', censoredListing)
uncensoredListing = re.sub('[%s]' % re.escape(string.punctuation), '', uncensoredListing)

blackList = re.split('\n', blackListing)
censoredList = re.split('\n', censoredListing)
whiteList = re.split('\n', whiteListing)
uncensoredList = re.split('\n', uncensoredListing)
greyList = re.split('\n', greyListing)

blackSet = set(blackList)
whiteSet = set(whiteList)

#censoredList = list(set(censoredList) - set(blackList))
#uncensoredList = list(set(uncensoredList) - set(whiteList))
#censoredList = censoredList.remove(blackList)

result = {}

#result[greylist_word] = [weight, summation, freq]
for item in greyList:
	if item != '':
		word, weight, frequency = item.split(',')
		result[word.lower()] = [float(weight), 0.0, float(frequency)]

for word in censoredList:
	if word.lower() in blackSet or word.lower() in whiteSet:
		continue
	elif word.lower() in result:
		result[word.lower()][1] += 1
		result[word.lower()][2] += 1
	else:
		result[word.lower()] = [0.0,1.0,1.0]

for word in uncensoredList:
	if word.lower() in blackSet or word.lower() in whiteSet:
		continue
	elif word.lower() in result:
		result[word.lower()][1] -= 1
		result[word.lower()][2] += 1
	else:
		result[word.lower()] = [0.0,-1.0,1.0]



def done(result):
	for word, values in result.items():
		print "%s,%s,%s" % (word.lower(), values[0] + float(values[1])/float(values[2]), values[2])

done(result)
