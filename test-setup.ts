import { JSDOM } from 'jsdom';
import React from 'react';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', { url: "http://localhost/" });
(global as any).window = dom.window;
(global as any).document = dom.window.document;
(global as any).React = React;
