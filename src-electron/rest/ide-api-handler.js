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
 * This module provides the interface to an extenal IDE: Simplicity Studio.
 *
 * @module External IDE interface.
 */

const restApi = require('../../src-shared/rest-api.js')
const env = require('../util/env.js')
const importJs = require('../importexport/import.js')
const exportJs = require('../importexport/export.js')
const path = require('path')
const http = require('http-status-codes')
const queryConfig = require('../db/query-config.js')
const dbEnum = require('../../src-shared/db-enum.js')
/**
 * HTTP GET: IDE open
 *
 * @param {*} db
 * @returns callback for the express uri registration
 */
function httpGetIdeOpen(db) {
  return (req, res) => {
    if (req.query.project) {
      let name = path.posix.basename(req.query.project)
      let zapFile = req.query.project

      env.logInfo(`Studio: Opening/Loading project(${name})`)

      importJs
        .importDataFromFile(db, zapFile, req.session.zapSessionId)
        .then((sessionId) => {
          let response = { sessionId: sessionId, sessionKey: req.session.id }
          env.logInfo(
            `Studio: Loaded project(${name}), ${JSON.stringify(response)}`
          )
          queryConfig.updateKeyValue(
            db,
            sessionId,
            dbEnum.sessionKey.filePath,
            zapFile
          )
          res.send(response)
        })
        .catch(function (err) {
          let msg = `Studio: Failed to load project(${zapFile})`
          env.logError(msg)
          res.status(http.StatusCodes.BAD_REQUEST).send({ error: msg })
          env.logError(err)
        })
    } else {
      let msg = 'Opening/Loading project: Missing "project" query string'
      env.logWarning(msg)
      res.status(http.StatusCodes.BAD_REQUEST).send({ error: msg })
    }
  }
}

/**
 * HTTP GET: IDE save
 *
 * @param {*} db
 * @returns callback for the express uri registration
 */
function httpGetIdeSave(db) {
  return (req, res) => {
    env.logInfo(`Saving project: sessionId(${req.session.zapSessionId})`)
    queryConfig
      .getSessionKeyValue(
        db,
        req.session.zapSessionId,
        dbEnum.sessionKey.filePath
      )
      .then((filePath) =>
        exportJs.exportDataIntoFile(db, req.session.zapSessionId, filePath)
      )
      .then((filePath) => {
        let projectName = path.posix.basename(filePath)
        env.logInfo(`Saving project: project(${projectName})`)
        res.status(http.StatusCodes.OK).send({ filePath: filePath })
      })
      .catch((err) => {
        let msg = `Unable to save project with sessionId(${req.session.zapSessionId})`
        env.logError(msg)
        env.logError(err)
        res.status(http.StatusCodes.BAD_REQUEST).send({
          error: msg,
        })
      })
  }
}

exports.get = [
  {
    uri: restApi.ide.open,
    callback: httpGetIdeOpen,
  },
  {
    uri: restApi.ide.save,
    callback: httpGetIdeSave,
  },
]
