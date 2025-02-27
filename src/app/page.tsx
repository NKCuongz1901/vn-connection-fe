'use client'
import { Layout, Menu, Carousel, Card, Button } from 'antd'
import { Header, Content, Footer } from 'antd/es/layout/layout'
import { HomeOutlined, BookOutlined, InfoCircleOutlined, EnvironmentOutlined, HeartOutlined, KubernetesOutlined } from '@ant-design/icons';

export default function Home() {
	return (
		<Layout>
		{/* Header */}
		<Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
		  <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>UniVini</div>
		  <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']}>
			<Menu.Item key="1" icon={<HomeOutlined />}>Home</Menu.Item>
			<Menu.Item key="2" icon={<HeartOutlined />}>Dating</Menu.Item>
			<Menu.Item key="2" icon={<EnvironmentOutlined />}>Event</Menu.Item>
			<Menu.Item key="2" icon={<KubernetesOutlined />}>Network</Menu.Item>
			<Menu.Item key="2" icon={<BookOutlined />}>Library</Menu.Item>
			<Menu.Item key="3" icon={<InfoCircleOutlined />}>About</Menu.Item>
		  </Menu>
		</Header>
  
		{/* Carousel */}
		<Content style={{ padding: '20px' }}>
		  <Carousel autoplay>
			<div><h3 style={carouselStyle}>Welcome to UniVini</h3></div>
			<div><h3 style={carouselStyle}>Discover Amazing Events</h3></div>
			<div><h3 style={carouselStyle}>Read, Learn, and Grow</h3></div>
		  </Carousel>
  
		  {/* Featured Books Section */}
		  <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px' }}>
			<Card title="Book 1" style={{ width: 300 }}>
			  <p>Author: Zani</p>
			  <Button type="primary">Read More</Button>
			</Card>
			<Card title="Book 2" style={{ width: 300 }}>
			  <p>Author: Forest</p>
			  <Button type="primary">Read More</Button>
			</Card>
		  </div>
		</Content>
  
		{/* Footer */}
		<Footer style={{ textAlign: 'center' }}>
		  UniVini ©{new Date().getFullYear()} Created by Vietnamhikers.com
		</Footer>
	  </Layout>
	)
}

const carouselStyle: React.CSSProperties = {
	height: '100px',
	color: '#fff',
	lineHeight: '100px',
	textAlign: 'center',
	background: '#364d79',
  };