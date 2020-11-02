SUFFIX = _njs

modules:
	converter helpers.js $(SUFFIX)
	converter addData.js $(SUFFIX)
	converter block.js $(SUFFIX)
	converter api.js $(SUFFIX)

	mv helpers$(SUFFIX).js ../../
	mv addData$(SUFFIX).js ../../
	mv block$(SUFFIX).js ../../
	mv api$(SUFFIX).js ../../
