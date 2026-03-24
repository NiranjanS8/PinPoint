package com.pinpoint.backend.dto.response;

import java.util.ArrayList;
import java.util.List;

public class FolderTreeNodeResponse {

    private Long id;
    private String name;
    private Long parentId;
    private List<FolderTreeNodeResponse> children = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    public List<FolderTreeNodeResponse> getChildren() {
        return children;
    }

    public void setChildren(List<FolderTreeNodeResponse> children) {
        this.children = children;
    }
}
