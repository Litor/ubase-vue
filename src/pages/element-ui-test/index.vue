<template>
    <div>
        <el-steps :space="100" :active="active" finish-status="success">
            <el-step title="步骤 1"></el-step>
            <el-step title="步骤 2"></el-step>
            <el-step title="步骤 3"></el-step>
        </el-steps>

        <el-button style="margin-top: 12px;" @click="next">下一步</el-button>
        <el-switch
                v-model="value1"
                on-text=""
                off-text="">
        </el-switch>
        <el-switch
                v-model="value2"
                on-color="#13ce66"
                off-color="#ff4949">
        </el-switch>
        <div>
            <el-alert
                    title="成功提示的文案"
                    type="success">
            </el-alert>
            <el-alert
                    title="消息提示的文案"
                    type="info">
            </el-alert>
            <el-alert
                    title="警告提示的文案"
                    type="warning">
            </el-alert>
            <el-alert
                    title="错误提示的文案"
                    type="error">
            </el-alert>
        </div>
        <div>
            <el-menu theme="dark" default-active="1" class="el-menu-demo" mode="horizontal" @select="handleSelect">
                <el-menu-item index="1">处理中心</el-menu-item>
                <el-submenu index="2">
                    <template slot="title">我的工作台</template>
                    <el-menu-item index="2-1">选项1</el-menu-item>
                    <el-menu-item index="2-2">选项2</el-menu-item>
                    <el-menu-item index="2-3">选项3</el-menu-item>
                </el-submenu>
                <el-menu-item index="3"><a href="https://www.ele.me" target="_blank">订单管理</a></el-menu-item>
            </el-menu>
            <div class="line"></div>
            <el-menu default-active="1" class="el-menu-demo" mode="horizontal" @select="handleSelect">
                <el-menu-item index="1">处理中心</el-menu-item>
                <el-submenu index="2">
                    <template slot="title">我的工作台</template>
                    <el-menu-item index="2-1">选项1</el-menu-item>
                    <el-menu-item index="2-2">选项2</el-menu-item>
                    <el-menu-item index="2-3">选项3</el-menu-item>
                </el-submenu>
                <el-menu-item index="3"><a href="https://www.ele.me" target="_blank">订单管理</a></el-menu-item>
            </el-menu>
        </div>
        <div>
            <el-carousel height="150px">
                <el-carousel-item v-for="item in 4">
                    <h3>{{ item }}</h3>
                </el-carousel-item>
            </el-carousel>
        </div>
    </div>
</template>
<script>
    export default {
        data() {
            return {
                active: 0,
                value1: true,
                value2: true
            };
        },

        methods: {
            next() {
                if (this.active++ > 2) this.active = 0;
            },
            handleSelect(key, keyPath) {
                console.log(key, keyPath);
            }
        }
    }
</script>
