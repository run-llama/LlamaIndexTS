"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (errMsg: string) => void;
  eventType?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class DynamicComponentErrorBoundary extends React.Component<
  Props,
  State
> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn(this.props.eventType, error, errorInfo);
    const errorMessage = `Fail to render ${this.props.eventType} component: ${error.message}`;
    this.props.onError?.(errorMessage);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}
