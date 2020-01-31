import * as React from "react"
import { HTMLSelect } from "@blueprintjs/core"
import { UseSignal } from "@jupyterlab/apputils"
import { IClusterListProps } from "./Interfaces"


function ClusterList({ clusterListChanged, onChange }: IClusterListProps) {
    return (
        <UseSignal signal={clusterListChanged} initialArgs={{ selectedCluster: null, clusters: [] }}>
            {(_, { clusters, selectedCluster }) =>
                <HTMLSelect
                    options={clusters.map(
                        (x: any) => ({ value: x.id, label: x.name })
                    )}
                    minimal={true}
                    className="jp-Notebook-toolbarCellTypeDropdown"
                    iconProps={{ icon: <span className="jp-MaterialIcon jp-DownCaretIcon bp3-icon" /> }}
                    onChange={(evt) => onChange(evt.currentTarget.value)}
                    value={selectedCluster}
                    {...{ "aria-label": "Cell type" }}
                />
            }
        </UseSignal>
    )
}

export default ClusterList
