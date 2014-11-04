from collections import OrderedDict
from re import match
from re import split
from re import sub

class PathIterator:
	PATH_IDENTIFIERS = r'[MLHVCSQTAmlhvcsqa]'
	NUMBERS = r'[0-9.-^A-z]'
	SEPERATORS = r'\s|\,'
	PATH_END = r'[Zz]'

	def __init__(self, path):
		self.parseable = path.translate(None, '\t\f')
		self.parseable = self.parseable.replace('\n', ' ')
		self.parseable = sub(r'([A-Za-z])([0-9]|\-)', self.insert, self.parseable)
	   
		self.parseable = self.parseable.replace(',', ' ')
	   
		self.parseable = sub(r'\s+', ' ', self.parseable) # replace any double space with a single space
	   
		self.tokens = split(' ', self.parseable)
		self.map = self.produce_map(self.tokens)
	  
		self.elements = self.process(self.map)
		#for element in self.elements:
		#	 print element

	def produce_map(self, tkns):
		self.m = OrderedDict()
		self.i = 0
		while self.i < len(tkns):
			if match(self.PATH_IDENTIFIERS, tkns[self.i]):
				self.m[self.i] = tkns[self.i]
			elif match(self.PATH_END, tkns[self.i]):
				self.m[self.i] = tkns[self.i]
			else:
				pass
			self.i += 1
		return self.m.items()

	def process(self, map):
		self.mm = []
		self.l = len(map)
		for e in range(self.l):
			try:
				self.element = map[e]
				self.future = map[e + 1]
				self.ident = self.element[1]
				self.start = self.element[0] + 1
				self.end = self.future[0]
				self.nbrs = self.tokens[self.start:self.end]
			except:
				self.element = map[e]
				self.ident = self.element[1]
				self.start = self.element[0] + 1
				self.end = len(self.tokens)
				self.nbrs = self.tokens[self.start:self.end]
			   
			finally:
				self.numbers = []
				for number in self.nbrs:
					self.numbers.append(float(number))
				self.mm.append((self.ident, self.numbers))
		return iter(self.mm)
		
	def __iter__(self): 
		return iter(self.elements)
		  
	def next(self):
		try:
			return self.elements.next()
		except:
			raise StopIteration

	def insert(self, match_obj):
		self.group = match_obj.group()
		return '{} {}'.format(self.group[0], self.group[1])