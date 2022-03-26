import { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import { Row, Col, Card, Divider, Typography, Button } from "antd";
import { Editor } from "@tinymce/tinymce-react";

function App() {
	const [messageList, setMessageList] = useState([]);
	const [usersList, setUsersList] = useState([]);
	const socket = useRef();
	let params = useParams();
	const editorRef = useRef(null);

	const send = () => {
		if (editorRef.current) {
			// sending message to the room
			socket.current.emit("send-message", {
				username: params.username,
				room: params.room,
				content: btoa(
					unescape(encodeURIComponent(editorRef.current.getContent()))
				),
			});
			editorRef.current.resetContent();
		}
	};

	useEffect(() => {
		if (params.username && params.room) {
			// connecting to the websocket node server from client
			socket.current = io("ws://localhost:3002");

			// innitiating a room in websocket node server from client
			socket.current.emit("initiate", {
				room: params.room,
				username: params.username,
			});

			// getting message from websocket node server
			socket.current.on("get-message", (data) => {
				setMessageList((oldArray) => [
					...oldArray,
					{
						username: data.username,
						content: data.content,
					},
				]);
				let element = document.querySelector("#chat-window .ant-card-body");
				element.scrollTop = element.scrollHeight - element.clientHeight;
			});

			// getting all active users in a from websocket node server
			socket.current.on("active-users", (data) => {
				setUsersList(data);
			});
		}
	}, []);

	const messagesUi = messageList.map((x, i) => {
		return (
			<Row key={i} justify={params.username == x.username ? "end" : "start"}>
				<Card style={{ maxWidth: "50%" }}>
					<div style={{ transform: "translate3d(-20px, -25px, 0)", height: 0 }}>
						<Typography.Text type="secondary">{x.username}</Typography.Text>
					</div>
					<div
						dangerouslySetInnerHTML={{
							__html: decodeURIComponent(escape(atob(x.content))),
						}}
					></div>
				</Card>
			</Row>
		);
	});

	return (
		<Row style={{ minHeight: "100vh" }} justify="center">
			<Col span={4}>
				<Card
					style={{ height: "100%" }}
					title={
						<>
							<Typography.Title level={4}>
								Room - {params.room}
							</Typography.Title>
						</>
					}
				>
					<Typography.Paragraph
						copyable={{
							text:
								location.protocol +
								"//" +
								location.host +
								"/join-room/" +
								params.room,
						}}
					>
						Shareable Room Link
					</Typography.Paragraph>

					<Divider />

					<Typography.Title level={5}>Active Users</Typography.Title>

					<Row>
						{usersList.map((users, i) => {
							return (
								<Col key={i} span={24}>
									{users.username}
								</Col>
							);
						})}
					</Row>
				</Card>
			</Col>
			<Col span={20}>
				<Card
					style={{ maxHeight: "70vh", height: "70vh" }}
					title={<Typography.Title level={4}>Messages</Typography.Title>}
					id="chat-window"
				>
					{messagesUi}
				</Card>
				<Card
					size="small"
					style={{ height: "30vh", backgroundColor: "#2f3742", padding: 0 }}
				>
					<Row
						justify="end"
						style={{
							border: "1px solid #f1f1f1",
							borderRadius: "15px",
							overflow: "hidden",
						}}
					>
						<Col span={22}>
							<Editor
								onInit={(evt, editor) => (editorRef.current = editor)}
								initialValue=""
								init={{
									height: 160,
									menubar: false,
									plugins: [
										"lists link autolink codesample code emoticons image",
									],
									toolbar1:
										"bold italic strikethrough | link | numlist bullist | " +
										"blockquote | code codesample",
									toolbar2: "image emoticons",
									content_style:
										"body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
									content_css: "dark",
									forced_root_block: false,
								}}
							/>
						</Col>
						<Col span={2}>
							<Row style={{ height: "100%" }} justify="end" align="bottom">
								<Button onClick={send} type="primary">
									Send
								</Button>
							</Row>
						</Col>
					</Row>
				</Card>
			</Col>
		</Row>
	);
}

export default App;
