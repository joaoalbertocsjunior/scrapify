//const tv = 'https://serpapi.com/search.json?q=tv&tbm=shop&location=Sao%20Paulo&hl=pt-BR&gl=br&api_key=f1d50516e62bae6ac4154e67b4bd44f83741b9ee31cc9b8eae5fdbc9de813e51'
//const carro = 'https://serpapi.com/search.json?q=carro&tbm=shop&location=Sao%20Paulo&hl=pt-BR&gl=br&api_key=f1d50516e62bae6ac4154e67b4bd44f83741b9ee31cc9b8eae5fdbc9de813e51'
//const locations = 'https://serpapi.com/locations.json';
//, { headers: { 'User-Agent': userAgent }  }
//https://www.google.com/search?q=tv&oq=tv&uule=w+CAIQICIZU3RhdGUgb2YgU2FvIFBhdWxvLEJyYXppbA&hl=pt-BR&gl=br&tbm=shop&sourceid=chrome&ie=UTF-8
//https://www.google.com/search?q=carro&oq=carro&uule=w+CAIQICIZU3RhdGUgb2YgU2FvIFBhdWxvLEJyYXppbA&hl=pt-BR&gl=br&tbm=shop&sourceid=chrome&ie=UTF-8
/**
axios
	.get(tv)
	.then(res => console.log(res))
	.catch(error => console.log(error));
	
axios
	.get(carro)
	.then(res => console.log(res))
	.catch(error => console.log(error));
**/
/*axios
	.get(locations)
	.then(res => {
		console.log(res);
			res.data.forEach((location) => {
				if (location.country_code === 'BR') {
					if (location.canonical_name.includes('Paulo')) {
						console.log(location);
					}
				}
			})
		}
	)
	.catch(error => console.log(error));*/
const axios = require('axios');
const htmlToJson = require('html-to-json');
var stringify = require('json-stringify-safe');
var util = require('util');
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:103.0) Gecko/20100101 Firefox/103.0';
const productArray = [
	/**'carros',
	'casas',**/
	'roteadores'
];
var generateUrl = (product) => {
	return `https://www.google.com/search?q=${product}&oq=${product}&uule=w+CAIQICIZU3RhdGUgb2YgU2FvIFBhdWxvLEJyYXppbA&hl=pt-BR&gl=br&tbm=shop&sourceid=chrome&ie=UTF-8`;
};
var generateUrlArray = (products) => {
	let urlArray = [];
	products.forEach((product) => {
		urlArray.push(generateUrl(product));
	});
	return urlArray;
};

var checkArray = (array) => {
	return Array.isArray(array);
};

var checkObject = (object) => {
	return (typeof object === 'object' && !checkArray(object) && object !== null);
};

var checkCircular = (object) => {
	return util.inspect(object).startsWith('<ref ');
};

var checkChildren = (prop) => {
	return prop !== "children";
};

var checkString = (param) => {
	return (typeof param === 'string');
};

var checkProperty = (prop) => {
	return (prop === ( "prev" || "next" || "parent" || "_root" ));
};

var checkNumber = (shouldCheck, object) => {
	if (shouldCheck) {
		return (typeof object === 'number');
	} else {
		return shouldCheck;
	}
};

var checkStringORNumber = ( shouldCheckNumber, object ) => {
	return (checkString(object) || checkNumber(shouldCheckNumber, object));
}

var iterateAndParse = (data) => {
	if (checkObject(data)) {
		for (const property in data) {
				if (checkProperty(property)) {
					delete data[property];
				}
				if (checkCircular(data[property]) && checkChildren(property)) {
					delete data[property];
				} else {
					iterateAndParse(data[property]);
				}
		};
	} else if (checkArray(data)) {
		data.forEach((item, index) => {
			iterateAndParse(item);
		});
	};
};

function Circular() {
	this.abc = "hello";
	this.circ = this;
	this.children = [
		this.abc = this,
		this.circ = 'banana',
		this.num = 2,
	];
};

var circle = new Circular();

const struct = {
	div: {
		child: [
			{
				item: "abc",
				content: "cde"
			},
			{
				item: "vfg",
				content: "tef"
			}			
		],
	},
	child: [
		{
			item: "jkm",
			content: "lmk",
			circle: circle,
			child: {
				data: "abc",
				property: circle,
				child: [
						{
							data: 'cde',
							prop: circle,
						}
					]
			}
		}
	]
};




//iterateAndParse(struct)

//console.log(struct.child[0].child);

//console.log(struct)

var batchExcludes = (  config  ) => {
	const excludes = config.excludes;
	const value = config.value;
	let result = true;
	excludes.forEach((exclude) => {
		if (value.includes(exclude)) {
			result = false;
		}
	});
	return result;
};

var lengthToSplice = 0;
var pos = 0;
var posArray = [];
var resultsArray = [];

var batchIncludes = (  config  ) => {
	const arrayOfIncludes = config.includes;
	const arrayOfExcludes = config.excludes;
	const checkNumbers = config.shouldCheckNumber;
	const value = config.value;
	const data = config.dataRoot;
	const prop = config.prop;
	arrayOfIncludes.forEach((include) => {
		if (value.includes(include)) {
			const batchExcludesConfig = {
				excludes: arrayOfExcludes,
				value: value,
			};
			if (batchExcludes( batchExcludesConfig )) {
				resultsArray.push(posArray);
				posArray = [];
			}
		}
	});
};

var getLength = (object) => {
	if ( checkArray(object) ) {
		return object.length;
	} else {
		return Object.keys(object).length;
	};
	return undefined || null;
};

let mainTree = [];
let tree = [];
let lastObject;
let depth = [];

var searchValueInJson = ( config ) => {
	let data = config.data;
	let dataRoot = null;
	let prop = null;
	let dataRootConfigPrototype = null;
	let propConfigPrototype = null;
	if (config.dataRoot) {
		dataRoot = config.dataRoot;
		dataRootConfigPrototype = {
			dataRoot: dataRoot
		};
	};
	if (config.prop) {
		prop = config.prop;
		propConfigPrototype = {
			prop: prop
		};
	};
	let includes = config.includes; 
	let excludes = config.excludes;
	let shouldCheckNumber = config.shouldCheckNumber;
	const configPrototype = {
		includes: includes,
		excludes: excludes,
		shouldCheckNumber: shouldCheckNumber
	};
	if ( checkStringORNumber( shouldCheckNumber, data ) ) {
		const batchIncludesConfig = {
			value: data,
			pos: pos
		};
		let mergeNewConfig = Object.assign( configPrototype, batchIncludesConfig );
		if ( dataRoot ) {
			mergeNewConfig = Object.assign( dataRootConfigPrototype, mergeNewConfig );
		};
		if ( prop ) {
			mergeNewConfig = Object.assign( propConfigPrototype, mergeNewConfig );
		};
		batchIncludes( mergeNewConfig );
	} else {
		if (checkObject(data) || checkArray(data)) {
			let i = 0;
			let length;
			for (const prop in data) {
				//console.log("i:", i, " keys: ", Object.keys(data).length, " prop :", prop);
				const exists = data?.[prop];
				if ( !checkStringORNumber( shouldCheckNumber, data[prop]) && exists) {
					mainTree.push(prop);
					lastObject = mainTree[ mainTree.length - 1 ];
					let currentDepth = getLength( data[prop] );
					depth.push( currentDepth );
				} else {
					mainTree.push(prop);
					length = getLength( lastObject );
				}
				let arrayCopy = mainTree;
				if (length >= 1) {
					arrayCopy.pop();
					tree.push( [ ...arrayCopy, prop ] );
				} else {
					if (i) {
						delete arrayCopy[ arrayCopy.length - ( i + 1) ];
						if (i === depth[ depth.length - 1 ]) { //must check depth
							//delete arrayCopy[ i - 1 ];
							for (let len = 0; i >= len; len++) {
								delete arrayCopy[ len ];
							}
						}
						tree.push( [ ...arrayCopy ] );
					} else {
						tree.push( [ ...mainTree ] );
					}
				}
				++i;
				const configMerge = {
					data: data[prop],
					pos: i,
					dataRoot: data,
					prop: prop
				};
				const newConfig = Object.assign( configMerge, configPrototype );
				searchValueInJson( newConfig );
			}
		}
	}
};

var cleanTree = (tree) => {
	let result = [];
	tree.forEach( (item, index) => {
		let instanceResult = [];
		item.forEach( (prop, i) => {
			if (prop !== undefined) {
				instanceResult.push(prop);
			}
		} );
		result.push(instanceResult);
	} );
	return result;
};

var getResultsArray = (searchValueInJsonConfig) => {
	const config = searchValueInJsonConfig;
	searchValueInJson(config);
	return resultsArray;
};

var posArray = [];
var recursivePosArray = [];
var lastPosition = [];

var recursivePosition = (config) => {
	let rPosArr = recursivePosArray;
	let lastPos;
	let pos = config.position;
	let index = config.index;
	let ps;
	if (rPosArr.length < 1) {
		lastPos = config.lastPosition;
	} else {
		lastPos = rPosArr[rPosArr.length - 1];
	}
	ps = lastPos.slice(0, pos.length + 1);
	if ((ps.length - 1) === 1) {
		ps.push(pos[index]);
	} else {
		ps[index + 1] = pos[index];
	}
	if ((pos.length - 1) > index) {
		const config = {
			lastPosition: ps,
			position: pos,
			index: (index + 1),
		};
		recursivePosition(config);
	} else {
		if (index > 0) {
			rPosArr.push(ps);
		} else {
			rPosArr = [];
		}
		lastPosition = ps;
		posArray.push(ps);
	}
};

var recursivePositionLength = ( config ) => {
	let pos = config.position;
	let lastPos = config.lastPosition;
	let index = config.index;
	if (pos[pos.length - index] === lastPos[lastPos.length - index]) {
		const config = {
			position: pos,
			lastPosition: lastPos,
			index: index + 1
		};
		recursivePositionLength( config );
	} else {
		const config = {
			lastPosition: lastPos,
			position: pos,
			index: 0
		};
		recursivePosition(config);
	}

};

var checkIfHasGreaterPosition = ( config ) => {
	let lastPos = config.lastPosition;
	let pos = config.position;
	let result;
	let i = 0;
	let shorterLength;
	if (pos.length <= lastPos.length) {
		shorterLength = pos.length;
	} else {
		shorterLength = lastPos.length;
	}
	while (i < shorterLength) {
		if (pos[i] <= lastPos[i]) {
			result = true;
		} else {
			result = false;
			break;
		}
		i++;
	};
	return result;
};

//Need to rework on JSON pos at backwards compability (low priority)
var parsePositionTree = (positionTreeArray) => {
	var posTreeArr = positionTreeArray;
	posTreeArr.forEach((position, index) => {
		if (lastPosition[0] < position[0]) {
			lastPosition = position;
			posArray.push(lastPosition);
		} else if (position.length < 1) {
			let currentPosition = posArray[posArray.length - 1];
			const config = {
				lastPosition: lastPosition,
				position: currentPosition
			};
			if (checkIfHasGreaterPosition( config )) {
				posArray.push(lastPosition);
			}
		} else {
			if (position[0] === 0) {
				lastPosition = [...lastPosition, ...position];
				posArray.push(lastPosition);
			} else {
				const recursivePositionConfig = {
					position: position,
					lastPosition: lastPosition,
					index: 0
				};
				recursivePositionLength( recursivePositionConfig );
			}
		}
	});
	return posArray;
};

let dataPoints = [];

var recursiveDataDepth = ( config ) => {
	let result = config.result;
	let index = config.index;
	let pos;
	if (checkArray(result)) {
		pos = `[${result[index]}]`;
	} else {
		pos = `[${result}]`;
	}
	if (index < 1) {
		dataPoints.push('data' + pos);
	} else {
		dataPoints[dataPoints.length - 1] += '.children' + pos;
	}
	if (index < (result.length - 1)) {
		const newConfig = {
			result: config.result,
			index: (index + 1)
		};
		recursiveDataDepth( newConfig );
	}
};

var getData = ( resultsArray ) => {
	resultsArray.forEach((result, index) => {
		const config = {
			result: result,
			index: 0
		};
		recursiveDataDepth( config );
	});
};

var printData = (dataSet) => {
	const data = dataSet;
	dataPoints.forEach((point) => {
		/**console.log(point);
		console.log('---------------')
		console.log(eval(point));**/
	});
};
						
var bootstrapFunctions = ( config ) => {
	const data = config.data;
	iterateAndParse(data);	
	const results = getResultsArray(config); //check
	console.log(results)
	/**const parsed = parsePositionTree(results); //check
	getData(parsed);
	printData(data);**/
};

var doRequests = (agent, products) => {
	products.forEach((product) => {
		axios
			.get(product)
			.then(res => {
				console.log(res.config.url);
				let promise = htmlToJson.parse(res.data, {
					'text':
					($doc) => {
						const data = $doc.children()[0].children[1].children;
						/**const config = {
							dataProp: data,
							includes: [
								'roteador',
								'Roteador'
							],
							excludes: [],
							pos: 0,
						};
						bootstrapFunctions( config );**/
					}
				}, (error, result) => {
					if (error) console.log(error);
					//console.log(result);
				});
			})
			.catch(error => console.log(error));
	});
};

//doRequests(userAgent, generateUrlArray(productArray));


const config = {
				data: struct,
				includes: [
					'abc'
				],
				shouldCheckNumber: false,
				excludes: [],
				pos: 0,
			};
			bootstrapFunctions( config );
			console.log("struct.div.child[0].item")
			console.log(struct.div.child[0].item)
			console.log("struct.child[0].child.data")
			console.log(struct.child[0].child.data);
			console.log(cleanTree(tree));
			console.log(struct.child[0].child.child)
			console.log("fix depth issue")
			//console.log(depth);