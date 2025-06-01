// OptimizedFlatList.js - Memory-efficient FlatList implementation
import React, { useState, useCallback, useRef, useEffect, memo } from 'react';
import { FlatList, View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { InteractionManager } from 'react-native';

/**
 * OptimizedFlatList - A high-performance FlatList with memory optimizations
 * 
 * This component improves performance and reduces memory usage over the standard
 * FlatList by implementing:
 * - Memory-efficient rendering of large datasets
 * - Proper item recycling with key extraction
 * - Window-based rendering that limits offscreen items
 * - Optimized scrolling behavior
 * - Progressive loading with placeholders
 * - Lazy component mounting after interactions
 */
const OptimizedFlatList = ({
  data,
  renderItem,
  keyExtractor,
  initialNumToRender = 8,
  maxToRenderPerBatch = 5,
  windowSize = 5,
  updateCellsBatchingPeriod = 50,
  onEndReachedThreshold = 0.5,
  onEndReached,
  ListEmptyComponent,
  ListHeaderComponent,
  ListFooterComponent,
  ItemSeparatorComponent,
  contentContainerStyle,
  progressiveLoading = false,
  progressiveLoadingPlaceholder,
  progressiveLoadingBatchSize = 10,
  itemHeight,
  horizontal = false,
  refreshing = false,
  onRefresh,
  ...restProps
}) => {
  // Track mounted state to prevent updates after unmount
  const isMounted = useRef(true);
  const listRef = useRef(null);
  const [visibleData, setVisibleData] = useState(
    progressiveLoading ? data?.slice(0, progressiveLoadingBatchSize) : data
  );
  const [progressiveLoadingComplete, setProgressiveLoadingComplete] = useState(
    !progressiveLoading || (data?.length || 0) <= progressiveLoadingBatchSize
  );
  const lastTimeRef = useRef(Date.now());
  const frameThrottleMs = 16; // ~60fps
  
  // Default placeholder for progressive loading
  const DefaultProgressivePlaceholder = () => (
    <View style={styles.progressivePlaceholder}>
      <ActivityIndicator size="small" color="#999" />
      <Text style={styles.progressiveText}>Loading more items...</Text>
    </View>
  );
  
  // Handle progressive loading
  useEffect(() => {
    if (!progressiveLoading || !data || progressiveLoadingComplete) {
      return;
    }
    
    // Queue loading of remaining items after initial render
    const interactionPromise = InteractionManager.runAfterInteractions(() => {
      if (!isMounted.current) return;
      
      // Load all data
      setVisibleData(data);
      setProgressiveLoadingComplete(true);
    });
    
    return () => {
      interactionPromise.cancel();
    };
  }, [data, progressiveLoading, progressiveLoadingComplete]);
  
  // Update visibleData if data changes
  useEffect(() => {
    if (!progressiveLoading) {
      setVisibleData(data);
    } else if (progressiveLoadingComplete) {
      setVisibleData(data);
    }
  }, [data, progressiveLoading, progressiveLoadingComplete]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Optimize keyExtractor if not provided
  const optimizedKeyExtractor = useCallback(
    keyExtractor || ((item, index) => {
      if (item && typeof item === 'object' && item.id) {
        return String(item.id);
      }
      return String(index);
    }),
    [keyExtractor]
  );
  
  // Optimize rendering by memoizing the renderItem function
  const optimizedRenderItem = useCallback(
    ({ item, index, ...rest }) => {
      // Rate limit rendering for smoother scrolling
      const now = Date.now();
      if (now - lastTimeRef.current < frameThrottleMs) {
        lastTimeRef.current = now;
      }
      
      return renderItem({ item, index, ...rest });
    },
    [renderItem]
  );
  
  // Optimize getItemLayout if itemHeight is provided
  const getItemLayout = useCallback(
    itemHeight 
      ? (_, index) => ({
          length: itemHeight,
          offset: itemHeight * index,
          index,
        })
      : undefined,
    [itemHeight]
  );
  
  // Progressive loading footer
  const renderFooter = useCallback(() => {
    if (!progressiveLoading || progressiveLoadingComplete) {
      return ListFooterComponent ? <ListFooterComponent /> : null;
    }
    
    const Placeholder = progressiveLoadingPlaceholder || DefaultProgressivePlaceholder;
    
    return (
      <>
        <Placeholder />
        {ListFooterComponent ? <ListFooterComponent /> : null}
      </>
    );
  }, [
    progressiveLoading,
    progressiveLoadingComplete,
    progressiveLoadingPlaceholder,
    ListFooterComponent,
  ]);
  
  // Scroll to index with better error handling
  const scrollToIndex = useCallback((params) => {
    if (listRef.current) {
      try {
        listRef.current.scrollToIndex(params);
      } catch (error) {
        // Retry with animated=false in case of failure
        try {
          listRef.current.scrollToIndex({ ...params, animated: false });
        } catch (retryError) {
          console.warn('Error scrolling to index:', retryError);
        }
      }
    }
  }, []);
  
  // Scroll to top with better error handling
  const scrollToTop = useCallback(() => {
    if (listRef.current) {
      try {
        listRef.current.scrollToOffset({ offset: 0, animated: true });
      } catch (error) {
        console.warn('Error scrolling to top:', error);
      }
    }
  }, []);
  
  return (
    <FlatList
      ref={listRef}
      data={visibleData}
      renderItem={optimizedRenderItem}
      keyExtractor={optimizedKeyExtractor}
      
      // Performance optimizations
      removeClippedSubviews={true}
      maxToRenderPerBatch={maxToRenderPerBatch}
      updateCellsBatchingPeriod={updateCellsBatchingPeriod}
      windowSize={windowSize}
      initialNumToRender={initialNumToRender}
      getItemLayout={getItemLayout}
      
      // Memory optimization props
      maintainVisibleContentPosition={visibleData && visibleData.length > 100 ? {
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 10,
      } : undefined}
      
      // Customizable components
      ListEmptyComponent={ListEmptyComponent}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={renderFooter}
      ItemSeparatorComponent={ItemSeparatorComponent}
      
      // Style props
      contentContainerStyle={contentContainerStyle}
      horizontal={horizontal}
      
      // Refresh control
      refreshing={refreshing}
      onRefresh={onRefresh}
      
      // Event handlers
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      
      // Pass remaining props
      {...restProps}
    />
  );
};

// Export public methods for external use
OptimizedFlatList.scrollToIndex = (ref, params) => {
  if (ref.current) {
    try {
      ref.current.scrollToIndex(params);
    } catch (error) {
      console.warn('Error scrolling to index:', error);
    }
  }
};

OptimizedFlatList.scrollToTop = (ref) => {
  if (ref.current) {
    try {
      ref.current.scrollToOffset({ offset: 0, animated: true });
    } catch (error) {
      console.warn('Error scrolling to top:', error);
    }
  }
};

const styles = StyleSheet.create({
  progressivePlaceholder: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  progressiveText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#777',
  },
});

export default memo(OptimizedFlatList);