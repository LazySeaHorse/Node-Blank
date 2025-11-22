/**
 * Math Node Organism
 */
import { interaction } from '../../state/appState.js';

export function createMathNode(data, onSelect) {
    const div = document.createElement('div');
    div.id = data.id;
    div.className = 'node node-math';
    div.style.left = `${data.x}px`;
    div.style.top = `${data.y}px`;
    div.style.zIndex = data.zIndex;
    
    const mf = document.createElement('math-field');
    mf.value = data.content;
    //mf.virtualKeyboardMode = "manual";
    
    mf.addEventListener('input', () => { 
        data.content = mf.value; 
    });
    
    mf.addEventListener('focus', () => { 
        interaction.activeInput = mf; 
        onSelect(data.id); 
    });
    
    // Prevent drag when interacting with math field
    mf.addEventListener('mousedown', e => e.stopPropagation());
    
    // Handle Enter for multiline
    mf.addEventListener('keydown', (e) => {
        if(e.key === 'Enter') { 
            e.preventDefault(); 
            e.stopPropagation(); 
            mf.executeCommand(['insert','\\\\']); 
        }
    });
    
    div.appendChild(mf);
    
    return div;
}
