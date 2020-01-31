import { ISignal } from '@lumino/signaling';


export interface IDatabrickConfig {
    api_key: string,
    cluster_id: string,
    uri: string
}

export interface IConfChanged {
    selectedCluster: string,
    clusters: Array<string>
}

export interface IClusterListProps {
    clusterListChanged: ISignal<any, IConfChanged>
    onChange: Function
}
