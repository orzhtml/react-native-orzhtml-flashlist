import React, { forwardRef, useCallback } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { FlashList, FlashListProps } from '@shopify/flash-list'

export enum PageStatus {
  firstLoad = 0,
  waiting = 1,
  inLoaded = 2,
  allLoaded = 3,
  noData = 4,
}

interface Props<T> extends Omit<FlashListProps<T>, 'onEndReached' | 'onRefresh'> {
  pagination?: boolean      // 分页功能开关
  isRefresh?: boolean       // 下拉刷新功能开关
  pageStatus: PageStatus
  onRefresh?: () => void
  onEndReached?: () => void
  refreshing?: boolean
}

const PaginationFooter = ({
  status,
  pagination,
}: {
  status: PageStatus,
  pagination: boolean
}) => {
  if (!pagination) return null

  switch (status) {
    case PageStatus.inLoaded:
      return (
        <View style={styles.footer}>
          <ActivityIndicator /> <Text style={styles.footerText}>加载中</Text>
        </View>
      )
    case PageStatus.allLoaded:
      return (
        <View style={styles.footer}>
          <Text style={styles.footerText}>暂无更多</Text>
        </View>
      )
    default:
      return null
  }
}

const OrzhtmlFlashList = forwardRef<FlashList<any>, Props<any>>((props, ref) => {
  const {
    data,
    pageStatus,
    refreshing = false,
    pagination = true,
    isRefresh = true,
    onRefresh,
    onEndReached,
    ListEmptyComponent,
    ListFooterComponent,
    ...rest
  } = props

  const handleEndReached = useCallback(() => {
    if (
      !pagination ||              // 分页功能关闭时阻止执行
      !data?.length ||
      refreshing ||
      pageStatus !== PageStatus.waiting
    ) return
    onEndReached?.()
  }, [pagination, data, refreshing, pageStatus, onEndReached])

  const handleRefresh = useCallback(() => {
    if (!isRefresh) return      // 下拉刷新功能关闭时阻止执行
    onRefresh?.()
  }, [isRefresh, onRefresh])

  const renderFooter = useCallback(() => {
    if (pageStatus === PageStatus.firstLoad || pageStatus === PageStatus.noData) {
      return null
    }
    return ListFooterComponent || (
      <PaginationFooter
        status={pageStatus}
        pagination={pagination}
      />
    )
  }, [ListFooterComponent, pageStatus, pagination])

  const renderEmpty = useCallback(() => {
    if (pageStatus === PageStatus.firstLoad) {
      return <ActivityIndicator />
    }
    return ListEmptyComponent || (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>暂无数据</Text>
      </View>
    )
  }, [ListEmptyComponent, pageStatus])

  return (
    <FlashList
      {...rest}
      ref={ref}
      data={data}
      extraData={[pageStatus, pagination]}
      refreshing={isRefresh ? refreshing : undefined}
      onRefresh={isRefresh ? handleRefresh : undefined}
      onEndReached={pagination ? handleEndReached : undefined}
      onEndReachedThreshold={0.1}
      ListEmptyComponent={renderEmpty()}
      ListFooterComponent={renderFooter()}
    />
  )
})

const styles = StyleSheet.create({
  empty: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  emptyText: {
    color: '#000',
    fontSize: 20,
    fontWeight: '700'
  },
  footer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  footerText: {
    color: '#999',
    fontSize: 14,
  },
})

export default OrzhtmlFlashList
