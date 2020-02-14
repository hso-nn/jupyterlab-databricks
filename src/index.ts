import {
  JupyterFrontEnd, JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  IDisposable, DisposableDelegate
} from '@phosphor/disposable';

import {
  ToolbarButton, showDialog, Dialog, ReactWidget
} from '@jupyterlab/apputils';

import {
  Kernel
} from '@jupyterlab/services'

import {
  DocumentRegistry
} from '@jupyterlab/docregistry';

import {
  NotebookPanel, INotebookModel, NotebookActions
} from '@jupyterlab/notebook';

import InputForm from "./InputForm"
import ClusterList from "./ClusterList"


import '../style/index.css';
import { Signal } from '@lumino/signaling';
import { IConfChanged, IDatabrickConfig, IClusterListItem } from "./Interfaces";


class DatabricksExtension implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {
  confChanged = new Signal<this, IConfChanged>(this)


  constructor(app: JupyterFrontEnd) {
    this.app = app;
  }

  readonly app: JupyterFrontEnd;

  createNew(panel: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>): IDisposable {
    let button: ToolbarButton
    let clusterList: ReactWidget
    let comm: Kernel.IComm
    let commActions: Kernel.IComm
    let config: IDatabrickConfig
    let clusters: Array<IClusterListItem>

    const configureDatabricks = async () => {
      let _config = new Map<string, string>(Object.entries(config))

      const _onChange = (key: string, value: string) => {
        _config.set(key, value)
      }

      const uri: string = _config.get("uri")
      const apiKey: string = _config.get("api_key")

      await showDialog({
        title: "Databricks Configuration",
        body: InputForm({ onChange: _onChange, uri, apiKey }),
        buttons: [Dialog.okButton()]
      })

      comm.send(Object.fromEntries(_config))
    };

    const clusterChanged = async (cluster_id: string) => {
      comm.send({ cluster_id })
    }

    const configChanged = async (msg: any) => {
      console.log(msg)
      const isNew = config === undefined

      config = msg.content.data.config
      clusters = msg.content.data.clusters

      this.confChanged.emit({ selectedCluster: msg.content.data.config.cluster_id, clusters })

      if (isNew) maybeAddWidgets()

      this.confChanged.emit({ selectedCluster: msg.content.data.config.cluster_id, clusters })
    }

    const maybeAddWidgets = () => {
      if (config === undefined) {
        return
      }

      if (button === undefined) {
        button = new ToolbarButton({
          iconClassName: 'fa fa-cogs',
          onClick: configureDatabricks,
          tooltip: 'Configure Databricks',
        });
        panel.toolbar.addItem('configureDatabricks', button)
      }

      if (clusterList === undefined) {
        clusterList = ReactWidget.create(ClusterList({ clusterListChanged: this.confChanged, onChange: clusterChanged }))
        panel.toolbar.addItem("clusterList", clusterList)
      }
    }

    const maybeRemoveWidgets = () => {
      if (button !== undefined) {
        button.dispose()
        button = undefined
      }

      if (clusterList !== undefined) {
        clusterList.dispose()
        clusterList = undefined
      }
    }

    const kernelChangedHandler = async (args: any | null) => {
      if (panel.session.kernel.name.startsWith("databricks")) {
        maybeAddWidgets()
        let msg: any;

        msg = await panel.session.kernel.requestCommInfo({ target_name: "databricks.config" })
        comm = panel.session.kernel.connectToComm("databricks.config", Object.keys(msg.content.comms)[0])
        comm.onMsg = configChanged

        msg = await panel.session.kernel.requestCommInfo({ target_name: "databricks.actions" })
        commActions = panel.session.kernel.connectToComm("databricks.actions", Object.keys(msg.content.comms)[0])

        setTimeout(() => comm.send("get_config"), 2000)
      } else {
        maybeRemoveWidgets()
        config = undefined
        await comm.close().done
        await commActions.close().done
      }
    }

    // kernelChangedHandler(null)
    panel.session.kernelChanged.connect(kernelChangedHandler)

    NotebookActions.executed.connect(async (_, { notebook, cell }) => {
      if (config !== undefined) {
        const cluster: IClusterListItem = clusters.reduce((a: any, b: IClusterListItem) => b.id === config.cluster_id ? b : a, null)
        if (cluster.state === "terminated") {
          await showDialog({ title: "Turn on cluster", body: `Cluster '${cluster.name}' is currently not running. Would you like to turn it on?` })
          commActions.send({ "action": "start_cluster", "data": { "cluster_id": cluster.id } })
        }
      }
    })

    return new DisposableDelegate(() => {
      button.dispose();
      clusterList.dispose();
    })
  }
}

function activate(app: JupyterFrontEnd): void {
  let buttonExtension = new DatabricksExtension(app);
  app.docRegistry.addWidgetExtension('Notebook', buttonExtension);
  // app.contextMenu.addItem({
  //   selector: '.jp-Notebook',
  //   command: 'notebook:run-all-cells',
  //   rank: -0.5
  // });
}

const extension: JupyterFrontEndPlugin<void> = {
  id: 'databricks-extension',
  autoStart: true,
  activate
};

export default extension;
