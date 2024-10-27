import path from 'path';

import fs from 'fs-extra';
import yaml from 'yaml';
import _ from 'lodash';

import environment from '../environment.ts';
import util from '../util.ts';

const CONFIG_PATH = path.join(path.resolve(), 'configs/', environment.env, "/service.yml");


export class ServiceConfig {


    name: string;

    host;

    port;

    urlPrefix;

    bindAddress;

    constructor(options?: any) {
        const { name, host, port, urlPrefix, bindAddress } = options || {};
        this.name = _.defaultTo(name, 'deepseek-free-api');
        this.host = _.defaultTo(host, '0.0.0.0');
        this.port = _.defaultTo(port, 5566);
        this.urlPrefix = _.defaultTo(urlPrefix, '');
        this.bindAddress = bindAddress;
    }

    get addressHost() {
        if(this.bindAddress) return this.bindAddress;
        const ipAddresses = util.getIPAddressesByIPv4();
        for(let ipAddress of ipAddresses) {
            if(ipAddress === this.host)
                return ipAddress;
        }
        return ipAddresses[0] || "127.0.0.1";
    }

    get address() {
        return `${this.addressHost}:${this.port}`;
    }

    get pageDirUrl() {
        return `http://127.0.0.1:${this.port}/page`;
    }

    get publicDirUrl() {
        return `http://127.0.0.1:${this.port}/public`;
    }

    static load() {
        const external = _.pickBy(environment, (v, k) => ["name", "host", "port"].includes(k) && !_.isUndefined(v));
        if(!fs.pathExistsSync(CONFIG_PATH)) return new ServiceConfig(external);
        const data = yaml.parse(fs.readFileSync(CONFIG_PATH).toString());
        return new ServiceConfig({ ...data, ...external });
    }

}

export default ServiceConfig.load();
