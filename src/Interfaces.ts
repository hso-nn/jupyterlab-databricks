import { ISignal } from '@lumino/signaling';


export interface IDatabrickConfig {
    api_key: string,
    cluster_id: string,
    uri: string
}

export interface IConfChanged {
    selectedCluster: string,
    clusters: Array<IClusterListItem>
}

export interface IClusterListProps {
    clusterListChanged: ISignal<any, IConfChanged>
    onChange: Function
}

export interface IClusterListItem {
    id: string,
    name: string,
    state: string
}
