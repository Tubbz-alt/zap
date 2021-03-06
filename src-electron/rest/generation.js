/**
 *
 *    Copyright (c) 2020 Silicon Labs
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

/**
 * This module provides the REST API to the generation.
 *
 * @module REST API: generation functions
 */

const generationEngine = require('../generator/generation-engine.js')
const queryPackage = require('../db/query-package.js')
const restApi = require('../../src-shared/rest-api.js')

/**
 * HTTP GET: preview single file with index.
 *
 * @param {*} db
 * @returns callback for the express uri registration
 */
function httpGetPreviewNameIndex(db) {
  return (request, response) => {
    var sessionId = request.session.zapSessionId
    generationEngine
      .generateSingleFileForPreview(db, sessionId, request.params.name)
      .then((previewObject) => {
        if (request.params.index in previewObject) {
          return response.json({
            result: previewObject[request.params.index],
            size: Object.keys(previewObject).length,
          })
        } else {
          return response.json({})
        }
      })
  }
}

/**
 * HTTP GET: Preview a single file.
 *
 * @param {*} db
 * @returns callback for the express uri registration
 */
function httpGetPreviewName(db) {
  return (request, response) => {
    var sessionId = request.session.zapSessionId
    generationEngine
      .generateSingleFileForPreview(db, sessionId, request.params.name)
      .then((previewObject) => response.json(previewObject))
  }
}

/**
 * HTTP GET: total preview object.
 *
 * @param {*} db
 * @returns callback for the express uri registration
 */
function httpGetPreview(db) {
  return (request, response) => {
    var sessionId = request.session.zapSessionId
    queryPackage
      .getSessionGenTemplates(db, sessionId)
      .then((previewObject) => response.json(previewObject))
  }
}

exports.get = [
  {
    uri: restApi.uri.previewNameIndex,
    callback: httpGetPreviewNameIndex,
  },
  {
    uri: restApi.uri.previewName,
    callback: httpGetPreviewName,
  },
  {
    uri: restApi.uri.preview,
    callback: httpGetPreview,
  },
]
