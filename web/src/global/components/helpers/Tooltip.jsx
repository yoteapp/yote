import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
/**
 * Tooltip component to display a tooltip on hover
 * takes an `as` prop to define the wrapper element (default `div`) and `wrapperClass` to add classes to the wrapper
 * This one will follow the mouse and will not overflow the screen
 * 
 * ```jsx
 *  // as a button
 *  <Tooltip text="I'll show up on hover" as='button' wrapperClass='some-button-classes'>
 *   I'm a button
 *  </Tooltip>
 * ```
 *  
 * ```jsx
 *  // as a div
 *  <Tooltip
 *    text={(
 *      <div className='bg-black rounded-lg px-4 py-2'>
 *        <p className='text-white hover:text-steel-300'>I'm a styled tooltip</p>
 *      </div>
 *    )}
 *    wrapperClass='some-div-classes'
 *  >
 *    I'm a div
 *  </Tooltip>
 * ```
 * 
 */
const Tooltip = ({
  children
  , text
  , wrapperClass = 'inline-block text-left'
  , tooltipPositionStyle
  , isOpen
  , as: WrapperComponent = 'div'
  , ...wrapperProps
}) => {
  const isExternallyControlled = typeof isOpen !== 'undefined'; // if isOpen is passed as a prop, the tooltip is externally controlled
  const [tipVisibility, setTipVisibility] = useState(isOpen ? 'block' : 'hidden');
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef(null); // Ref to access the tooltip element

  useEffect(() => {
    if(isOpen === true) {
      setTipVisibility('block');
    } else if(isOpen === false) {
      setTipVisibility('hidden');
    }
  }, [isOpen]);

  const handleMouseEnter = (e) => {
    if(isExternallyControlled) return;
    adjustTooltipPosition(e);
    setTipVisibility('block');
  };

  const handleMouseMove = (e) => {
    adjustTooltipPosition(e);
  };

  const handleMouseLeave = () => {
    if(isExternallyControlled) return;
    setTipVisibility('hidden');
  };

  const adjustTooltipPosition = (e) => {
    const { clientX, clientY } = e;

    // Access the tooltip dimensions dynamically
    const tooltipElement = tooltipRef.current;
    if(!tooltipElement) return;

    const tooltipRect = tooltipElement.getBoundingClientRect();
    const tooltipWidth = tooltipRect.width;
    const tooltipHeight = tooltipRect.height;
    const widthOffset = tooltipWidth * 0.5;
    const heightOffset = tooltipHeight * 0.5;

    let adjustedLeft = clientX - widthOffset
    let adjustedTop = clientY + heightOffset

    // Check if tooltip overflows to the right of the screen
    if(adjustedLeft + tooltipWidth + 10 > window.innerWidth) {
      adjustedLeft = window.innerWidth - tooltipWidth - 10;
    }
    // no left overflow
    if(adjustedLeft < 10) {
      adjustedLeft = 10
    }

    // Check if tooltip overflows to the bottom of the screen
    if(adjustedTop + tooltipHeight + 10 > window.innerHeight) {
      adjustedTop = window.innerHeight - tooltipHeight - 10;
    }
    // no top overflow
    if(adjustedTop < 10) {
      adjustedTop = 10;
    }

    setTooltipPosition({ top: adjustedTop, left: adjustedLeft });
  };

  return (
    <WrapperComponent
      className={`relative z-20 ${wrapperClass}`}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...wrapperProps}
    >
      <div
        ref={tooltipRef} // Attach ref to the tooltip element
        className={`absolute max-w-sm min-w-fit bg-black text-white text-sm rounded-lg px-4 py-2 shadow-lg ${tipVisibility}`}
        style={tooltipPositionStyle || { top: `${tooltipPosition.top}px`, left: `${tooltipPosition.left}px`, position: 'fixed' }}
      >
        {text}
      </div>
      {children}
    </WrapperComponent>
  );
};

Tooltip.propTypes = {
  children: PropTypes.node.isRequired
  , text: PropTypes.node.isRequired
  , wrapperClass: PropTypes.string
  , tooltipPositionStyle: PropTypes.object // optional style object to override the tooltip position ex: { top: 0, left: 0, position: 'absolute' }
  , isOpen: PropTypes.bool // optional prop to control the tooltip visibility
  , as: PropTypes.elementType
};

export default Tooltip;
