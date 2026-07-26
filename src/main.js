import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css' // import the file include tailwind

const app = createApp(App)

app.use(router) // use Vue
app.mount('#app')
