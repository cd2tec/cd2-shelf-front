TEMP_BUILD_API = $(PWD)/.tmp-build-api
VERSION = $(shell git rev-parse --abbrev-ref HEAD)-$(shell git rev-parse --short HEAD)
IMAGE_TAG = 234988416211.dkr.ecr.sa-east-1.amazonaws.com/unitrier/frontend:$(VERSION)

api:
	@echo "Temp Dir: $(TEMP_BUILD_API)"
	@echo "Swagger Definition: $(shell dirname `pwd`)/unitrier/api/swagger"
	@rm -Rf $(TEMP_BUILD_API) && mkdir $(TEMP_BUILD_API)
	@echo '{"modelPropertyNaming": "original"}' > $(TEMP_BUILD_API)/swagger.config.json
	@docker run -ti --rm --user=$(shell id -u):$(shell id -g) \
	        -v "$(TEMP_BUILD_API):/output" \
	        -v "$(shell dirname `pwd`)/unitrier/api/swagger:/api" \
	        swaggerapi/swagger-codegen-cli generate -l typescript-fetch -c /output/swagger.config.json \
	        -i /api/api.swagger.json -o /output/api
	@rm -Rf ./src/services/api/generated
	@mkdir ./src/services/api/generated
	@cp $(TEMP_BUILD_API)/api/*.ts ./src/services/api/generated/
	@rm -Rf $(TEMP_BUILD_API)

build:
	docker build --build-arg "API_ENDPOINT=https://dev-unitrier.tempocerto.io/api" -t unitrier.local/frontend:latest .

publish:
	docker tag unitrier.local/frontend:latest $(IMAGE_TAG)
	docker push $(IMAGE_TAG)
	@echo ""
	@echo "   Image: $(IMAGE_TAG)"
	@echo "   Version: $(VERSION)"
	@echo ""

release: build publish
