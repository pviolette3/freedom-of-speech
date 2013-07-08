import re, string

blackListFile = open("blacklist.txt", "r")
censoredListFile = open("censoredlist.txt", "r+")
whiteListFile = open("whitelist.txt", "r")
uncensoredListFile = open("uncensoredlist.txt", "r+")
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

result = {} #make sure this is read from the greylist

#result[greylist_word] = [weight, summation, freq]
for item in greyList:
	if item != '':
		word, weight, summation, frequency = item.split(',')
		result[word] = [float(weight), 0, float(frequency)]

for word in censoredList:
	if word in blackSet or word in whiteSet:
		continue
	elif word in result:
		result[word][1] += 1
		result[word][2] += 1
	else:
		result[word] = [0,1,1]

for word in uncensoredList:
	if word in blackSet or word in whiteSet:
		continue
	elif word in result:
		result[word][1] -= 1
		result[word][2] += 1
	else:
		result[word] = [0,-1,1]



def done(result):
	for word, values in result.items():
		print "%s,%s,%s,%s\n" % (word, values[0], values[1], values[2])

done(result)






