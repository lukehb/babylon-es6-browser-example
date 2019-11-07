Demonstration showing browswer importing of babylon es6.
To enable importing in the browser babylon es6 must undergo source transformation to make it browser legal.

To run the example:

- ```npm install```
- ```npm start```
- ```navigate to http://localhost:3000```

The source transformation is done as npm postinstall step using jscodeshift.
The jscodeshift configuration is in ./config/transform.js