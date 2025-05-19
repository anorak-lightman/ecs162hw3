import { test } from 'vitest';
import { render } from '@testing-library/svelte';
import App from './App.svelte';

test('App', async () => {
    render(App);
});