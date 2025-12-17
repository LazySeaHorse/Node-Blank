import { h, render } from 'preact';
import { useState, useEffect, useRef, useLayoutEffect, useMemo, useCallback } from 'preact/hooks';
import htm from 'htm';

// Initialize htm with Preact
const html = htm.bind(h);

export {
    h,
    render,
    html,
    useState,
    useEffect,
    useRef,
    useLayoutEffect,
    useMemo,
    useCallback
};
