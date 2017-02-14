<template>
    <div>
        <div>i18n title: {{$t('index.title')}}</div>
        <div>config: name: {{$root.config.name}}</div>
        <input type="text" v-model="ps.test.a.b.h">
        <div v-html="ps.test.a.b.h"></div>
    </div>
</template>
<script>
    export default {
        computed: {
            ps(){
                return this.$store.index
            }
        },

        mounted(){
            console.log(this.$root.config.name)
        }
    }
</script>
