export * from "./gen/types.gen.js"

import { createClient, type Client } from "./gen/client/client.gen.js"
import { type Config } from "./gen/client/types.gen.js"
import * as sdk from "./gen/sdk.gen.js"

export { type Config as OpencodeClientConfig }

// Wrapper class that provides nested namespace access to SDK functions
export class OpencodeClient {
  private _client: Client

  constructor(opts: { client: Client }) {
    this._client = opts.client
  }

  session = {
    list: (opts?: Parameters<typeof sdk.sessionList>[0]) => sdk.sessionList({ ...opts, client: this._client }),
    create: (opts?: Parameters<typeof sdk.sessionCreate>[0]) => sdk.sessionCreate({ ...opts, client: this._client }),
    get: (opts: Parameters<typeof sdk.sessionGet>[0]) => sdk.sessionGet({ ...opts, client: this._client }),
    update: (opts: Parameters<typeof sdk.sessionUpdate>[0]) => sdk.sessionUpdate({ ...opts, client: this._client }),
    delete: (opts: Parameters<typeof sdk.sessionDelete>[0]) => sdk.sessionDelete({ ...opts, client: this._client }),
    status: (opts: Parameters<typeof sdk.sessionStatus>[0]) => sdk.sessionStatus({ ...opts, client: this._client }),
    children: (opts: Parameters<typeof sdk.sessionChildren>[0]) => sdk.sessionChildren({ ...opts, client: this._client }),
    todo: (opts: Parameters<typeof sdk.sessionTodo>[0]) => sdk.sessionTodo({ ...opts, client: this._client }),
    init: (opts: Parameters<typeof sdk.sessionInit>[0]) => sdk.sessionInit({ ...opts, client: this._client }),
    fork: (opts: Parameters<typeof sdk.sessionFork>[0]) => sdk.sessionFork({ ...opts, client: this._client }),
    abort: (opts: Parameters<typeof sdk.sessionAbort>[0]) => sdk.sessionAbort({ ...opts, client: this._client }),
    share: (opts: Parameters<typeof sdk.sessionShare>[0]) => sdk.sessionShare({ ...opts, client: this._client }),
    unshare: (opts: Parameters<typeof sdk.sessionUnshare>[0]) => sdk.sessionUnshare({ ...opts, client: this._client }),
    diff: (opts: Parameters<typeof sdk.sessionDiff>[0]) => sdk.sessionDiff({ ...opts, client: this._client }),
    summarize: (opts: Parameters<typeof sdk.sessionSummarize>[0]) => sdk.sessionSummarize({ ...opts, client: this._client }),
    messages: (opts: Parameters<typeof sdk.sessionMessages>[0]) => sdk.sessionMessages({ ...opts, client: this._client }),
    message: (opts: Parameters<typeof sdk.sessionMessage>[0]) => sdk.sessionMessage({ ...opts, client: this._client }),
    prompt: (opts: Parameters<typeof sdk.sessionPrompt>[0]) => sdk.sessionPrompt({ ...opts, client: this._client }),
    promptAsync: (opts: Parameters<typeof sdk.sessionPromptAsync>[0]) => sdk.sessionPromptAsync({ ...opts, client: this._client }),
    command: (opts: Parameters<typeof sdk.sessionCommand>[0]) => sdk.sessionCommand({ ...opts, client: this._client }),
    shell: (opts: Parameters<typeof sdk.sessionShell>[0]) => sdk.sessionShell({ ...opts, client: this._client }),
    revert: (opts: Parameters<typeof sdk.sessionRevert>[0]) => sdk.sessionRevert({ ...opts, client: this._client }),
    unrevert: (opts: Parameters<typeof sdk.sessionUnrevert>[0]) => sdk.sessionUnrevert({ ...opts, client: this._client }),
  }

  config = {
    get: (opts?: Parameters<typeof sdk.configGet>[0]) => sdk.configGet({ ...opts, client: this._client }),
    update: (opts: Parameters<typeof sdk.configUpdate>[0]) => sdk.configUpdate({ ...opts, client: this._client }),
    providers: (opts?: Parameters<typeof sdk.configProviders>[0]) => sdk.configProviders({ ...opts, client: this._client }),
  }

  globalConfig = {
    get: (opts?: Parameters<typeof sdk.globalConfigGet>[0]) => sdk.globalConfigGet({ ...opts, client: this._client }),
    update: (opts: Parameters<typeof sdk.globalConfigUpdate>[0]) => sdk.globalConfigUpdate({ ...opts, client: this._client }),
  }

  global = {
    health: (opts?: Parameters<typeof sdk.globalHealth>[0]) => sdk.globalHealth({ ...opts, client: this._client }),
    dispose: (opts?: Parameters<typeof sdk.globalDispose>[0]) => sdk.globalDispose({ ...opts, client: this._client }),
    event: (opts: Parameters<typeof sdk.globalEvent>[0]) => sdk.globalEvent({ ...opts, client: this._client }),
  }

  instance = {
    dispose: (opts?: Parameters<typeof sdk.instanceDispose>[0]) => sdk.instanceDispose({ ...opts, client: this._client }),
  }

  project = {
    list: (opts?: Parameters<typeof sdk.projectList>[0]) => sdk.projectList({ ...opts, client: this._client }),
    current: (opts?: Parameters<typeof sdk.projectCurrent>[0]) => sdk.projectCurrent({ ...opts, client: this._client }),
    update: (opts: Parameters<typeof sdk.projectUpdate>[0]) => sdk.projectUpdate({ ...opts, client: this._client }),
  }

  provider = {
    list: (opts?: Parameters<typeof sdk.providerList>[0]) => sdk.providerList({ ...opts, client: this._client }),
    auth: (opts?: Parameters<typeof sdk.providerAuth>[0]) => sdk.providerAuth({ ...opts, client: this._client }),
    oauth: {
      authorize: (opts: Parameters<typeof sdk.providerOauthAuthorize>[0]) => sdk.providerOauthAuthorize({ ...opts, client: this._client }),
      callback: (opts: Parameters<typeof sdk.providerOauthCallback>[0]) => sdk.providerOauthCallback({ ...opts, client: this._client }),
    },
  }

  find = {
    files: (opts: Parameters<typeof sdk.findFiles>[0]) => sdk.findFiles({ ...opts, client: this._client }),
    symbols: (opts: Parameters<typeof sdk.findSymbols>[0]) => sdk.findSymbols({ ...opts, client: this._client }),
    text: (opts: Parameters<typeof sdk.findText>[0]) => sdk.findText({ ...opts, client: this._client }),
  }

  file = {
    list: (opts?: Parameters<typeof sdk.fileList>[0]) => sdk.fileList({ ...opts, client: this._client }),
    read: (opts: Parameters<typeof sdk.fileRead>[0]) => sdk.fileRead({ ...opts, client: this._client }),
    status: (opts?: Parameters<typeof sdk.fileStatus>[0]) => sdk.fileStatus({ ...opts, client: this._client }),
  }

  pty = {
    list: (opts?: Parameters<typeof sdk.ptyList>[0]) => sdk.ptyList({ ...opts, client: this._client }),
    create: (opts: Parameters<typeof sdk.ptyCreate>[0]) => sdk.ptyCreate({ ...opts, client: this._client }),
    get: (opts: Parameters<typeof sdk.ptyGet>[0]) => sdk.ptyGet({ ...opts, client: this._client }),
    update: (opts: Parameters<typeof sdk.ptyUpdate>[0]) => sdk.ptyUpdate({ ...opts, client: this._client }),
    remove: (opts: Parameters<typeof sdk.ptyRemove>[0]) => sdk.ptyRemove({ ...opts, client: this._client }),
    connect: (opts: Parameters<typeof sdk.ptyConnect>[0]) => sdk.ptyConnect({ ...opts, client: this._client }),
  }

  tool = {
    list: (opts: Parameters<typeof sdk.toolList>[0]) => sdk.toolList({ ...opts, client: this._client }),
    ids: (opts: Parameters<typeof sdk.toolIds>[0]) => sdk.toolIds({ ...opts, client: this._client }),
  }

  mcp = {
    status: (opts?: Parameters<typeof sdk.mcpStatus>[0]) => sdk.mcpStatus({ ...opts, client: this._client }),
    add: (opts: Parameters<typeof sdk.mcpAdd>[0]) => sdk.mcpAdd({ ...opts, client: this._client }),
    connect: (opts: Parameters<typeof sdk.mcpConnect>[0]) => sdk.mcpConnect({ ...opts, client: this._client }),
    disconnect: (opts: Parameters<typeof sdk.mcpDisconnect>[0]) => sdk.mcpDisconnect({ ...opts, client: this._client }),
    authStart: (opts: Parameters<typeof sdk.mcpAuthStart>[0]) => sdk.mcpAuthStart({ ...opts, client: this._client }),
    authCallback: (opts: Parameters<typeof sdk.mcpAuthCallback>[0]) => sdk.mcpAuthCallback({ ...opts, client: this._client }),
    authAuthenticate: (opts: Parameters<typeof sdk.mcpAuthAuthenticate>[0]) => sdk.mcpAuthAuthenticate({ ...opts, client: this._client }),
    authRemove: (opts: Parameters<typeof sdk.mcpAuthRemove>[0]) => sdk.mcpAuthRemove({ ...opts, client: this._client }),
  }

  permission = {
    list: (opts: Parameters<typeof sdk.permissionList>[0]) => sdk.permissionList({ ...opts, client: this._client }),
    reply: (opts: Parameters<typeof sdk.permissionReply>[0]) => sdk.permissionReply({ ...opts, client: this._client }),
    respond: (opts: Parameters<typeof sdk.permissionRespond>[0]) => sdk.permissionRespond({ ...opts, client: this._client }),
  }

  question = {
    list: (opts: Parameters<typeof sdk.questionList>[0]) => sdk.questionList({ ...opts, client: this._client }),
    reply: (opts: Parameters<typeof sdk.questionReply>[0]) => sdk.questionReply({ ...opts, client: this._client }),
    reject: (opts: Parameters<typeof sdk.questionReject>[0]) => sdk.questionReject({ ...opts, client: this._client }),
  }

  part = {
    update: (opts: Parameters<typeof sdk.partUpdate>[0]) => sdk.partUpdate({ ...opts, client: this._client }),
    delete: (opts: Parameters<typeof sdk.partDelete>[0]) => sdk.partDelete({ ...opts, client: this._client }),
  }

  app = {
    agents: (opts?: Parameters<typeof sdk.appAgents>[0]) => sdk.appAgents({ ...opts, client: this._client }),
    skills: (opts?: Parameters<typeof sdk.appSkills>[0]) => sdk.appSkills({ ...opts, client: this._client }),
    log: (opts: Parameters<typeof sdk.appLog>[0]) => sdk.appLog({ ...opts, client: this._client }),
  }

  auth = {
    set: (opts: Parameters<typeof sdk.authSet>[0]) => sdk.authSet({ ...opts, client: this._client }),
    remove: (opts: Parameters<typeof sdk.authRemove>[0]) => sdk.authRemove({ ...opts, client: this._client }),
  }

  lsp = {
    status: (opts?: Parameters<typeof sdk.lspStatus>[0]) => sdk.lspStatus({ ...opts, client: this._client }),
  }

  formatter = {
    status: (opts?: Parameters<typeof sdk.formatterStatus>[0]) => sdk.formatterStatus({ ...opts, client: this._client }),
  }

  path = {
    get: (opts?: Parameters<typeof sdk.pathGet>[0]) => sdk.pathGet({ ...opts, client: this._client }),
  }

  vcs = {
    get: (opts?: Parameters<typeof sdk.vcsGet>[0]) => sdk.vcsGet({ ...opts, client: this._client }),
  }

  command = {
    list: (opts?: Parameters<typeof sdk.commandList>[0]) => sdk.commandList({ ...opts, client: this._client }),
  }

  tui = {
    appendPrompt: (opts: Parameters<typeof sdk.tuiAppendPrompt>[0]) => sdk.tuiAppendPrompt({ ...opts, client: this._client }),
    clearPrompt: (opts?: Parameters<typeof sdk.tuiClearPrompt>[0]) => sdk.tuiClearPrompt({ ...opts, client: this._client }),
    executeCommand: (opts: Parameters<typeof sdk.tuiExecuteCommand>[0]) => sdk.tuiExecuteCommand({ ...opts, client: this._client }),
    publish: (opts: Parameters<typeof sdk.tuiPublish>[0]) => sdk.tuiPublish({ ...opts, client: this._client }),
    selectSession: (opts: Parameters<typeof sdk.tuiSelectSession>[0]) => sdk.tuiSelectSession({ ...opts, client: this._client }),
    openSessions: (opts?: Parameters<typeof sdk.tuiOpenSessions>[0]) => sdk.tuiOpenSessions({ ...opts, client: this._client }),
    openModels: (opts?: Parameters<typeof sdk.tuiOpenModels>[0]) => sdk.tuiOpenModels({ ...opts, client: this._client }),
    openThemes: (opts?: Parameters<typeof sdk.tuiOpenThemes>[0]) => sdk.tuiOpenThemes({ ...opts, client: this._client }),
    openHelp: (opts?: Parameters<typeof sdk.tuiOpenHelp>[0]) => sdk.tuiOpenHelp({ ...opts, client: this._client }),
    controlNext: (opts?: Parameters<typeof sdk.tuiControlNext>[0]) => sdk.tuiControlNext({ ...opts, client: this._client }),
    controlResponse: (opts: Parameters<typeof sdk.tuiControlResponse>[0]) => sdk.tuiControlResponse({ ...opts, client: this._client }),
  }

  event = {
    subscribe: (opts?: Parameters<typeof sdk.eventSubscribe>[0]) => sdk.eventSubscribe({ ...opts, client: this._client }),
  }

  experimental = {
    resource: {
      list: (opts?: Parameters<typeof sdk.experimentalResourceList>[0]) => sdk.experimentalResourceList({ ...opts, client: this._client }),
    },
  }

  agentProcess = {
    list: (opts?: Parameters<typeof sdk.agentProcessList>[0]) => sdk.agentProcessList({ ...opts, client: this._client }),
    spawn: (opts: Parameters<typeof sdk.agentProcessSpawn>[0]) => sdk.agentProcessSpawn({ ...opts, client: this._client }),
    sendPrompt: (opts: Parameters<typeof sdk.agentProcessSendPrompt>[0]) => sdk.agentProcessSendPrompt({ ...opts, client: this._client }),
    cancel: (opts: Parameters<typeof sdk.agentProcessCancel>[0]) => sdk.agentProcessCancel({ ...opts, client: this._client }),
    stop: (opts: Parameters<typeof sdk.agentProcessStop>[0]) => sdk.agentProcessStop({ ...opts, client: this._client }),
  }
}

export function createOpencodeClient(config?: Config & { directory?: string }) {
  if (!config?.fetch) {
    const customFetch: any = (req: any) => {
      // @ts-ignore
      req.timeout = false
      return fetch(req)
    }
    config = {
      ...config,
      fetch: customFetch,
    }
  }

  if (config?.directory) {
    const isNonASCII = /[^\x00-\x7F]/.test(config.directory)
    const encodedDirectory = isNonASCII ? encodeURIComponent(config.directory) : config.directory
    config.headers = {
      ...config.headers,
      "x-opencode-directory": encodedDirectory,
    }
  }

  const client = createClient(config)
  return new OpencodeClient({ client })
}
