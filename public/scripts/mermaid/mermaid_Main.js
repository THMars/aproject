module.exports = {
    // 第一步要将tree数据转换为平行数据结构
    treeToListStart(res) {
        //初始化cache中的数据
        this.cache = {
            "id": "4566dsafds",
            "projects": [{}]
        }

        //进行调用分解tree结构方法
        return this.treeToList(res);
    },
    // 分解tree结构方法
    treeToList(data) {
        let $self = this;

        for (var i = 0; i < data.length; i++) {
            $self.cache.projects[0].links = $self.cache.projects[0].links || [];
            $self.cache.projects[0].nodes = $self.cache.projects[0].nodes || [];

            for (var n = 0; n < data[i].children.length; n++) {

                $self.cache.projects[0].links.push({
                    "info": {},
                    "label": data[i].nodeInfo.param,
                    "sourceId": data[i].nodeId,
                    "targetId": data[i].children[n].nodeId
                });
            }

            if (!data[i].children.length) {
                $self.cache.projects[0].links.push({
                    "info": {},
                    "label": data[i].nodeInfo.param,
                    "sourceId": data[i].nodeId
                });
            } else {
                //如果发现children中还有其他参数，就在进行递归调用
                $self.treeToList(data[i].children);
            }

            $self.cache.projects[0].nodes.push({
                "id": data[i].nodeId || "",
                "label": data[i].nodeInfo.param,
                "info": data[i].nodeInfo
            })
        }

        return $self.cache;
    },
    //根据当前给出的制定数据，进行mermaid视图的加载
    mermaidLoad(id, List, callback) {
        let $self = this;

        // 将数据结构分解为可以加载的语句
        let graphDefinition = 'graph TB';

        let links = List.projects[0].links;
        let nodes = List.projects[0].nodes;
        for (let i = 0; i < links.length; i++) {
            graphDefinition += '\n' + links[i].sourceId + '(' + $self.nodeLabelSwich(links[i].sourceId, nodes) + ")";

            if (links[i].targetId) {
                graphDefinition += '-->' + links[i].targetId + '(' + $self.nodeLabelSwich(links[i].targetId, nodes) + ")";
            }

            graphDefinition += ';';
        }

        // 获取需要放置的容器
        let element = document.querySelector(id);
        // 渲染完成后的callback
        let insertSvg = function(svgCode, bindFunctions) {
            //将渲染出来的svg放置到容器中
            element.innerHTML = svgCode;
            bindFunctions(element)
            console.log("123");
            // 加载成功后调用传入的callback
            if (callback) {
                callback();
            }
        };
        console.log(graphDefinition);
        // 开始渲染
        let graph = mermaidAPI.render("graphDiv", graphDefinition, insertSvg, element);

    },
    //对于当前给出的id，对当前list进行查找，返回匹配的数据的id
    nodeLabelSwich(id, nodes) {
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].id === id) {
                return nodes[i].label;
            }
        }
    },
    // 返回制定id的节点和关系信息
    getSelectNode(id) {
        let nodes = this.cache.projects[0].nodes;
        let links = this.cache.projects[0].links;
        let obj = {
            "links": [],
            "nodes": []
        };
        for (let i = 0; i < nodes.length; i++) {
            if (id == nodes[i].id) {
                obj.nodes.push(nodes[i]);
            }
        }

        for (let n = 0; n < links.length; n++) {
            if (id == links[n].sourceId) {
                obj.links.push(links[n]);
            }
        }

        return obj;
    },
    // 放置返回数据的存储位置
    "cache": {
        "id": "4566dsafds",
        "projects": [{}]
    }
}