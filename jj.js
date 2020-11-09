import request from '@/utils/request';
import { stringify } from 'qs';

// 获取服务树接口
export async function getServerTreeInfo() {
    return request(`http://wenba-sba-web.in_${process.env.name}.wenba100.com/tree/getServerTreeInfo`);
}
// 获取服务树信息
export async function getServerTreeInfoById(params) {
    return request(`http://wenba-sba-web.in_${process.env.name}.wenba100.com/tree/getServerTreeInfoById?${stringify(params)}`);
}
// 删除节点内容
export async function delServerTreeInfo(params) {
    return request(`http://wenba-sba-web.in_${process.env.name}.wenba100.com/tree/delServerTreeInfo?${stringify(params)}`);
}
// 修改服务树节点
export async function updateServerTreeInfo(params) {
    return request(`http://wenba-sba-web.in_${process.env.name}.wenba100.com/tree/updateServerTreeInfo`, {
        method: 'POST',
        body: {
            ...params,
        },
    });
}
// 添加节点内容
export async function addNodeInfo(params) {
    return request(`http://wenba-sba-web.in_${process.env.name}.wenba100.com/tree/addNodeInfo`, {
        method: 'POST',
        body: {
            ...params,
        },
    });
}

// 查询gitlub信息接口
export async function getWenbaSbaGitlabBySid(params) {
    return request(`http://wenba-sba-web.in_${process.env.name}.wenba100.com/gitlab/getWenbaSbaGitlabBySid?${stringify(params)}`);
}
// 删除gitlub信息接口
export async function deleteWenbaSbaGitlabById(params) {
    return request(`http://wenba-sba-web.in_${process.env.name}.wenba100.com/gitlab/deleteWenbaSbaGitlabById?${stringify(params)}`);
}
// 添加gitlub 信息接口
export async function addWenbaSbaGitlab(params) {
    return request(`http://wenba-sba-web.in_${process.env.name}.wenba100.com/gitlab/addWenbaSbaGitlab`,{
        method: 'POST',
        body: {
            ...params,
        },
    });
}
// 修改 gitlub信息接口
export async function updateWenbaSbaGitlab(params) {
    return request(`http://wenba-sba-web.in_${process.env.name}.wenba100.com/gitlab/updateWenbaSbaGitlab`,{
        method: 'POST',
        body: {
            ...params,
        },
    });
}
// 拖拽节点
export async function moveNode(params) {
    return request(`http://wenba-sba-web.in_${process.env.name}.wenba100.com/tree/moveNode`,{
        method: 'POST',
        body: {
            ...params,
        },
    });
}
