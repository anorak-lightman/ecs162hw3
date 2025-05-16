import { mount } from 'svelte'
import './login.css'
import App from './Login.svelte'

const app = mount(App, {
  target: document.getElementById('login')!,
})

export default app

"use strict";
