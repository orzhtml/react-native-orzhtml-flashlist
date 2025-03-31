# RN FlashList 增强组件

基于`@shopify/flash-list`封装的智能分页列表组件，支持下拉刷新、上拉加载、多状态提示等功能

## 特性
- 🕹 分页/刷新功能开关
- 📊 智能空状态处理
- 🎚 分页状态自动管理
- 💅 高度可定制化UI
- 🛡 严格的类型检查

## 安装
```bash
yarn add @shopify/flash-list react-native-reanimated

## 基本用法
```
import { OrzhtmlFlashList, PageStatus } from 'react-native-orzhtml-flashlist'

function BasicExample() {
  const [data, setData] = useState([])
  const [status, setStatus] = useState(PageStatus.firstLoad)
  const [refreshing, setRefreshing] = useState(true)

  return (
    <OrzhtmlFlashList
      data={data}
      pageStatus={status}
      refreshing={refreshing}
      onRefresh={fetchData}
      onEndReached={loadMore}
      renderItem={({ item }) => <ListItem data={item} />}
      estimatedItemSize={100}
    />
  )
}
```

## Props 说明

属性名 | 类型 | 默认值 | 说明
------ | ------ | ------ | ------
`pageStatus` | `PageStatus` | `‌必填‌` | 分页状态
`pagination` | `boolean` | `true` | 是否启用分页功能
`isRefresh` | `boolean` | `true` | 是否启用下拉刷新
`onRefresh` | `() => void` | - | 下拉刷新回调
`onEndReached` | `() => void` | - | 上拉加载回调
`refreshing` | `boolean` | `false` | 刷新状态
...其他 | FlashList原生props | - | 支持所有FlashList属性

## PageStatus 枚举
```
enum PageStatus {
  firstLoad = 0, // 首次加载
  waiting = 1,   // 可加载更多
  inLoaded = 2,  // 正在加载
  allLoaded = 3, // 全部加载完成
  noData = 4     // 无数据状态
}
```

## 高级用法
### 禁用分页功能
```
<OrzhtmlFlashList
  pagination={false}
  // 其他配置...
/>
```

### 禁用下拉刷新
```
<OrzhtmlFlashList
  isRefresh={false}
  // 其他配置...
/>
```

### 自定义加载状态
```
<OrzhtmlFlashList
  ListFooterComponent={
    <View style={{padding: 20}}>
      <ActivityIndicator color="red"/>
      <Text>正在玩命加载...</Text>
    </View>
  }
  // 其他配置...
/>
```

## 状态流程图
graph TD
  A[首次加载] -->|成功| B{数据为空?}
  B -->|是| C[无数据状态]
  B -->|否| D[可加载更多]
  D -->|触底| E[加载中]
  E -->|成功| F{还有更多?}
  F -->|是| D
  F -->|否| G[全部加载完成]

## 注意事项

1、必须通过pageStatus和refreshing控制状态
2、首次加载需要手动设置refreshing={true}
3、数据更新后自动保持滚动位置
4、空数据状态会自动隐藏底部组件
5、确保列表容器有明确的高度

## 完整示例
```
import { OrzhtmlFlashList, PageStatus } from 'react-native-orzhtml-flashlist'

function FullDemo() {
  const [data, setData] = useState<Item[]>([]);
  const [pageStatus, setPageStatus] = useState(PageStatus.firstLoad);
  const [refreshing, setRefreshing] = useState(true);
  const currentPage = useRef(1);

  // 加载数据
  const loadData = async (page: number) => {
    try {
      const res = await api.getList(page);
      
      setData(prev => page === 1 ? res.data : [...prev, ...res.data]);
      setPageStatus(res.hasMore ? PageStatus.waiting : PageStatus.allLoaded);
      
    } catch (error) {
      setPageStatus(PageStatus.noData);
    } finally {
      setRefreshing(false);
    }
  };

  // 下拉刷新
  const handleRefresh = () => {
    setRefreshing(true);
    currentPage.current = 1;
    loadData(1);
  };

  // 上拉加载
  const handleEndReached = () => {
    currentPage.current += 1;
    setPageStatus(PageStatus.inLoaded);
    loadData(currentPage.current);
  };

  return (
    <OrzhtmlFlashList
      data={data}
      pageStatus={pageStatus}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      onEndReached={handleEndReached}
      renderItem={({ item }) => <ListItem item={item} />}
      estimatedItemSize={120}
    />
  );
}
```