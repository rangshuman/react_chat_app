import { useNavigate, useParams } from "react-router-dom";
import { Row, Col, Form, Input, Typography, Button } from "antd";

function App() {
	const [detailsForm] = Form.useForm();
	const params = useParams();
	let navigate = useNavigate();

	const createRoom = () => {
		let roomNumber = params.room || Math.floor(1000 + Math.random() * 900000);
		navigate(
			"/chat-room/" + roomNumber + "/" + detailsForm.getFieldValue("username")
		);
	};

	return (
		<div>
			<Row style={{ height: 500 }} justify="center" align="middle">
				<Col span={8}>
					<Row justify="center" align="middle">
						<Typography.Title>Welcome to the chat app</Typography.Title>
						{params.room ? (
							<Typography.Title level={5}>
								You are about to join room {params.room}
							</Typography.Title>
						) : (
							""
						)}
					</Row>
					<Form form={detailsForm} layout="vertical" onFinish={createRoom}>
						<Form.Item label="Your Name" name="username">
							<Input placeholder="Enter your name" />
						</Form.Item>
						<Form.Item name="username">
							<Button type="primary" htmlType="submit">
								{params.room ? "Join Room" : "Create Room"}
							</Button>
						</Form.Item>
					</Form>
				</Col>
			</Row>
		</div>
	);
}

export default App;
