import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { Dialog, Transition } from '@headlessui/react'
import Spinner from '../helpers/Spinner';

/**
 * A reusable modal component using the headlessui library
 */
const Modal = ({
  children = null
  , closeText = 'Cancel'
  , confirmText = 'Confirm'
  , disabled = false
  , handleClose
  , handleConfirm
  , isOpen = false
  , title = ''
  , widthClass
  , hideButtons = false
  , loadingMessage = 'Loading...'
  , isLoading = false
  , type = 'action' // or 'info', controls the position of the modal
}) => {

  // Must have a close handler
  if(!handleClose) throw new Error('Modal requires a handleClose function');
  
  // Compute default widthClass based on the 'type' prop
  const modalWidth = widthClass || (type === 'info' ? 'w-full max-w-sm' : 'mt-8 sm:mt-40 w-full md:max-w-[596px]');

  // Container classes based on 'type'
  const containerClass = type === 'info'
    ? 'fixed inset-0 z-10 flex items-end justify-center sm:justify-end mb-0 mx-0 sm:mx-4'
    : 'fixed inset-0 z-10 overflow-y-auto';

  // Panel classes based on 'type'
  const panelClass = type === 'info'
    ? `bg-stone-100 p-8 relative transform overflow-hidden rounded-t-lg text-left shadow-xl transition-all ${modalWidth}`
    : `bg-stone-100 p-8 relative m-auto transform overflow-hidden rounded-lg text-left shadow-xl transition-all ${modalWidth}`;

  // Transition classes based on 'type'
  const transitionProps = type === 'info'
    ? {
      enter: 'transform transition ease-in-out duration-500 sm:duration-700',
      enterFrom: 'translate-y-full',
      enterTo: 'translate-y-0',
      leave: 'transform transition ease-in-out duration-500 sm:duration-700',
      leaveFrom: 'translate-y-0',
      leaveTo: 'translate-y-full',
    }
    : {
      enter: 'ease-out duration-300',
      enterFrom: 'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95',
      enterTo: 'opacity-100 translate-y-0 sm:scale-100',
      leave: 'ease-in duration-200',
      leaveFrom: 'opacity-100 translate-y-0 sm:scale-100',
      leaveTo: 'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95',
    };

  // Conditionally render the overlay for 'action' type
  const renderOverlay = type === 'action';

  return (
    <Transition.Root show={isOpen} as={Fragment} onClose={() => { }}>
      <Dialog as="div" className="relative z-[500]">
        {isLoading && <LoadingOverlay message={loadingMessage} />}
        {renderOverlay && (
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>
        )}
        <div className={containerClass}>
          <Transition.Child as={Fragment} {...transitionProps}>
            <Dialog.Panel className={panelClass}>
              <div className={hideButtons ? '' : 'mb-8'}>
                <div className="text-left">
                  {title && (
                    <Dialog.Title as="p" className="text-pf-slate-500">
                      {title}
                    </Dialog.Title>
                  )}
                  <div className="absolute top-2 right-3">
                    <button onClick={handleClose}>
                      <i className="fal fa-xmark-circle" />
                    </button>
                  </div>
                  {children}
                </div>
              </div>
              {!hideButtons && (
                <div className="flex row gap-2 justify-between">
                  <button
                    type="button"
                    className="btn btn-cancel w-full"
                    onClick={handleClose}
                  >
                    {closeText}
                  </button>
                  {handleConfirm && (
                    <button
                      type="button"
                      className="btn w-full"
                      onClick={handleConfirm}
                      disabled={disabled}
                    >
                      {confirmText}
                    </button>
                  )}
                </div>
              )}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

const LoadingOverlay = ({ message }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center flex-col bg-pf-slate-700 bg-opacity-75">
      <Spinner />
      <div className="absolute flex items-center justify-center top-[60%] left-0 w-full">
        <p className="w-fit p-2 bg-pf-slate-700 rounded-lg font-bold text-lg text-white">
          <span className="animate-pulse">{message}</span>
        </p>
      </div>
    </div>
  );
};

Modal.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  closeText: PropTypes.string,
  confirmText: PropTypes.string,
  disabled: PropTypes.bool,
  handleClose: PropTypes.func.isRequired,
  handleConfirm: PropTypes.func,
  isOpen: PropTypes.bool,
  title: PropTypes.string,
  widthClass: PropTypes.string,
  hideButtons: PropTypes.bool,
  loadingMessage: PropTypes.string,
  isLoading: PropTypes.bool,
  type: PropTypes.oneOf(['action', 'info']), // changes the position of the modal
};

export default Modal;
