[reference paper:http://leebyron.com/streamgraph/stackedgraphs_byron_wattenberg.pdf]
【version 1:2015_07_30 00:52】
[整体思路]：维护一个队列存放由下到上的各个layer的编号，每个计算点x（即该x时layer们有读入或随机产生的具体的y增量值）先计算最底层对应的y。
[变量说明]：每个layer有start和end，表示该layer进入和离开的时间。dat[]存放y增量值，ord[]存放计算好的y坐标。
m为计算点点数。interval每两计算点间距离。
>>index1.html & streamgraph1.js
  #数据随机产生，start不一定为0，end也不一定为m-1。
  #start<end,两端的dat值必为0。
  #只存放start之后的dat，之前的显然为0（其实貌似不差这一点点空间）。
  #不插值直接连线，把interval设小时效果还算可以。
>>index2.html & streamgraph2.js
  #在index1基础上加入贝塞尔插值，对任意(x1,y1)(x2,y2)，产生(x3,y3)(x4,y4),其中x3=(x2-x1)/3+x1,x4=(x2-x1)/3*2+x1,y3和y4介于y1和y2之间。
  #计算过程中仅仅存储ord是不够的，于是干脆去掉ord[]，pointarr[]用来存取所有的点(每段曲线由interval条细小折线构成，故数组长度约为canvas的width)。
  #一条曲线同时是上一层layer的下边界，和下一层layer的上边界；利用JS数组的unshift和push灵活实现。
  #没有道理的控制点选法，效果极差。
>>index3.html & streamgraph3.js
  #为了得到更好的随机数据产生法，直接照搬[http://bl.ocks.org/mbostock/4060954],同时还修改index1的数据随机方式为该方法，方便对比。
  #p1,p2,p3,p4……pn,以p2~p3这条为例，除了首尾两点p2p3，还需要两个控制点，分别为p2+(p3-p1)*v,p3-(p4-p2)*v
  #给color赋予含义：用单色表示，蓝绿红分别表示早期中期后期出现，相应亮度越高表示该layer总面积越大，透明度用于取分相邻两层


 	