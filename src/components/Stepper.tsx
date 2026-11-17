"use client";

import React, { useState, Children, useRef, useLayoutEffect, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface StepperProps {
  children: React.ReactNode;
  initialStep?: number;
  onStepChange?: (step: number) => void;
  onFinalStepCompleted?: () => void;
  beforeNextStep?: (step: number) => boolean;
  stepCircleContainerClassName?: string;
  stepContainerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  backButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  nextButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  backButtonText?: string;
  nextButtonText?: string;
  completeButtonText?: string;
  disableStepIndicators?: boolean;
  renderStepIndicator?: (props: {
    step: number;
    currentStep: number;
    onStepClick: (step: number) => void;
  }) => React.ReactNode;
  className?: string;
}

export default function Stepper({
  children,
  initialStep = 1,
  onStepChange = () => {},
  onFinalStepCompleted = () => {},
  beforeNextStep,
  stepCircleContainerClassName = "",
  stepContainerClassName = "",
  contentClassName = "",
  footerClassName = "",
  backButtonProps = {},
  nextButtonProps = {},
  backButtonText = "Back",
  nextButtonText = "Continue",
  completeButtonText = "Complete",
  disableStepIndicators = false,
  renderStepIndicator,
  className = "",
  ...rest
}: StepperProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [direction, setDirection] = useState(0);
  const stepsArray = Children.toArray(children);
  const totalSteps = stepsArray.length;
  const isCompleted = currentStep > totalSteps;
  const isLastStep = currentStep === totalSteps;

  const updateStep = (newStep: number) => {
    setCurrentStep(newStep);
    if (newStep > totalSteps) {
      onFinalStepCompleted();
    } else {
      onStepChange(newStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      updateStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (beforeNextStep && !beforeNextStep(currentStep)) {
      return;
    }
    if (!isLastStep) {
      setDirection(1);
      updateStep(currentStep + 1);
    }
  };

  const handleComplete = () => {
    if (beforeNextStep && !beforeNextStep(currentStep)) {
      return;
    }
    setDirection(1);
    updateStep(totalSteps + 1);
  };

  return (
    <div className={`w-full flex flex-col items-center justify-center ${className}`} {...rest}>
      <div
        className={`w-full bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/90 shadow-[0_24px_60px_rgba(10,61,115,0.18),0_4px_20px_rgba(28,111,217,0.12),inset_0_1px_1px_rgba(255,255,255,0.95)] ${stepCircleContainerClassName}`}
      >
        {/* Step Indicator Row */}
        <div className={`flex items-center justify-between w-full mb-6 pb-1 ${stepContainerClassName}`}>
          {stepsArray.map((_, index) => {
            const stepNumber = index + 1;
            const isNotLastStep = index < totalSteps - 1;
            return (
              <React.Fragment key={stepNumber}>
                {renderStepIndicator ? (
                  renderStepIndicator({
                    step: stepNumber,
                    currentStep,
                    onStepClick: (clicked) => {
                      if (clicked < currentStep || !beforeNextStep || beforeNextStep(currentStep)) {
                        setDirection(clicked > currentStep ? 1 : -1);
                        updateStep(clicked);
                      }
                    },
                  })
                ) : (
                  <StepIndicator
                    step={stepNumber}
                    disableStepIndicators={disableStepIndicators}
                    currentStep={currentStep}
                    onClickStep={(clicked) => {
                      if (clicked < currentStep || !beforeNextStep || beforeNextStep(currentStep)) {
                        setDirection(clicked > currentStep ? 1 : -1);
                        updateStep(clicked);
                      }
                    }}
                  />
                )}
                {isNotLastStep && <StepConnector isComplete={currentStep > stepNumber} />}
              </React.Fragment>
            );
          })}
        </div>

        {/* Step Content */}
        <StepContentWrapper
          isCompleted={isCompleted}
          currentStep={currentStep}
          direction={direction}
          className={`relative overflow-hidden ${contentClassName}`}
        >
          {stepsArray[currentStep - 1]}
        </StepContentWrapper>

        {/* Navigation Footer */}
        {!isCompleted && (
          <div className={`mt-6 pt-4 border-t border-gray-100 ${footerClassName}`}>
            <div className={`flex items-center ${currentStep !== 1 ? "justify-between" : "justify-end"} gap-3`}>
              {currentStep !== 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-[#4A5B70] hover:text-[#0F1B2B] hover:bg-gray-50 transition-all cursor-pointer"
                  {...backButtonProps}
                >
                  {backButtonText}
                </button>
              )}
              <button
                type="button"
                onClick={isLastStep ? handleComplete : handleNext}
                className="group relative overflow-hidden inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#1C6FD9] to-[#257BE5] hover:from-[#1762C4] hover:to-[#1C6FD9] text-white font-bold text-xs uppercase tracking-wider shadow-[0_4px_14px_rgba(28,111,217,0.32)] hover:shadow-[0_8px_20px_rgba(28,111,217,0.42)] transition-all cursor-pointer border border-white/20 active:scale-[0.98]"
                {...nextButtonProps}
              >
                <span className="relative z-10">{isLastStep ? completeButtonText : nextButtonText}</span>
                <span className="relative z-10">→</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StepContentWrapper({
  isCompleted,
  currentStep,
  direction,
  children,
  className,
}: {
  isCompleted: boolean;
  currentStep: number;
  direction: number;
  children: React.ReactNode;
  className: string;
}) {
  const [parentHeight, setParentHeight] = useState<number | undefined>(undefined);

  return (
    <motion.div
      className={className}
      style={{ position: "relative" }}
      animate={{ height: isCompleted ? 0 : parentHeight }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      <AnimatePresence initial={false} mode="sync" custom={direction}>
        {!isCompleted && (
          <SlideTransition
            key={currentStep}
            direction={direction}
            onHeightReady={(h) => setParentHeight(h)}
          >
            {children}
          </SlideTransition>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SlideTransition({
  children,
  direction,
  onHeightReady,
}: {
  children: React.ReactNode;
  direction: number;
  onHeightReady: (h: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (containerRef.current) {
      onHeightReady(containerRef.current.scrollHeight + 6);
    }
  }, [children, onHeightReady]);

  return (
    <motion.div
      ref={containerRef}
      custom={direction}
      variants={stepVariants}
      initial={direction === 0 ? false : "enter"}
      animate="center"
      exit="exit"
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="w-full px-1.5 py-1"
      style={{ position: "absolute", left: 0, right: 0, top: 0 }}
    >
      {children}
    </motion.div>
  );
}

const stepVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 36 : dir < 0 ? -36 : 0,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -36 : dir < 0 ? 36 : 0,
    opacity: 0,
    scale: 0.98,
  }),
};

export function Step({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`w-full space-y-4 ${className}`}>{children}</div>;
}

function StepIndicator({
  step,
  currentStep,
  onClickStep,
  disableStepIndicators,
}: {
  step: number;
  currentStep: number;
  onClickStep: (step: number) => void;
  disableStepIndicators?: boolean;
}) {
  const status = currentStep === step ? "active" : currentStep < step ? "inactive" : "complete";

  const handleClick = () => {
    if (step !== currentStep && !disableStepIndicators) onClickStep(step);
  };

  return (
    <motion.div
      onClick={handleClick}
      className="relative cursor-pointer outline-none select-none"
      style={disableStepIndicators ? { pointerEvents: "none", opacity: 0.6 } : {}}
      animate={status}
      initial={false}
    >
      <motion.div
        variants={{
          inactive: { scale: 1, backgroundColor: "#EAF5FF", color: "#6B7F96" },
          active: { scale: 1.08, backgroundColor: "#1C6FD9", color: "#FFFFFF" },
          complete: { scale: 1, backgroundColor: "#00A878", color: "#FFFFFF" },
        }}
        transition={{ duration: 0.3 }}
        className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full font-bold text-xs sm:text-sm border border-white/80 shadow-sm"
      >
        {status === "complete" ? (
          <CheckIcon className="w-4 h-4 text-white" />
        ) : status === "active" ? (
          <div className="w-2.5 h-2.5 rounded-full bg-white shadow-xs" />
        ) : (
          <span className="step-number">{step}</span>
        )}
      </motion.div>
    </motion.div>
  );
}

function StepConnector({ isComplete }: { isComplete: boolean }) {
  const lineVariants = {
    incomplete: { width: "0%", backgroundColor: "transparent" },
    complete: { width: "100%", backgroundColor: "#1C6FD9" },
  };

  return (
    <div className="relative mx-2 sm:mx-3 h-1 flex-1 overflow-hidden rounded-full bg-[#E2EDF8]">
      <motion.div
        className="absolute left-0 top-0 h-full"
        variants={lineVariants}
        initial={false}
        animate={isComplete ? "complete" : "incomplete"}
        transition={{ duration: 0.4 }}
      />
    </div>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.1, type: "tween", ease: "easeOut", duration: 0.3 }}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}
