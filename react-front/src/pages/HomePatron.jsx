import React, { useEffect, useState } from "react";
import {
  Container,
  Title,
  Loader,
  Alert,
  SimpleGrid,
  Text,
  Button,
  Group,
  Avatar,
  Card,
  Badge,
  Stack,
} from "@mantine/core";
import { IconCalendar, IconEye, IconLock, IconUsers } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import Slider from "../components/Slider";

const getAccessIcon = (pristup) => {
  switch (pristup) {
    case "javno":
      return <IconEye size={16} />;
    case "pretplatnici":
      return <IconUsers size={16} />;
    case "nivo":
      return <IconLock size={16} />;
    default:
      return null;
  }
};

const getAccessColor = (pristup) => {
  switch (pristup) {
    case "javno":
      return "green";
    case "pretplatnici":
      return "blue";
    case "nivo":
      return "orange";
    default:
      return "gray";
  }
};

const getAccessLabel = (pristup) => {
  switch (pristup) {
    case "javno":
      return "Javno";
    case "pretplatnici":
      return "Samo pretplatnici";
    case "nivo":
      return "Određeni nivo";
    default:
      return pristup;
  }
};

export default function HomePatron() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await api.get("/patron/feed");
        setPosts(res.data.posts?.data || []);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Ne mogu da učitam objave.");
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex" }}>
        <Slider />
        <div style={{ flex: 1, padding: 24 }}>
          <Loader />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex" }}>
        <Slider />
        <div style={{ flex: 1, padding: 24 }}>
          <Alert color="red" title="Greška">
            {error}
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex" }}>
      <Slider />
      <div style={{ flex: 1, padding: 24 }}>
        <Container size="lg">
          <Title order={2} mb="lg">Obaveštenja od kreatora</Title>

          {posts.length === 0 ? (
            <Alert color="blue" title="Info">
              Još uvek niste pretplaćeni ni na jednog kreatora. Pretplatite se da biste videli njihove objave.
            </Alert>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
              {posts.map((post) => (
                <Card key={post.id} withBorder shadow="sm" radius="md" padding="lg">
                  <Card.Section withBorder inheritPadding py="xs">
                    <Group justify="space-between" align="center">
                      <Text fw={700} size="lg" lineClamp={1}>
                        {post.naslov}
                      </Text>
                    </Group>
                  </Card.Section>

                  <Stack gap="sm" mt="sm">
                    {/* Creator info with avatar and button */}
                    <Group gap="xs" align="center">
                      <Avatar size="sm" radius="xl" color="blue">
                        {post.creator_page_name?.charAt(0) || "K"}
                      </Avatar>
                      <Text size="sm" fw={500}>
                        {post.creator_page_name}
                      </Text>
                      <Button
                        size="xs"
                        variant="light"
                        color="blue"
                        onClick={() => navigate(`/creators/${post.creator_id}`)}
                      >
                        Pogledaj profil
                      </Button>
                    </Group>

                    {/* Post content preview */}
                    <Text size="sm" lineClamp={3}>
                      {post.sadrzaj}
                    </Text>

                    {/* Date */}
                    <Group gap="xs" align="center">
                      <IconCalendar size={14} color="gray" />
                      <Text size="xs" c="dimmed">
                        {new Date(post.datum_objave).toLocaleDateString()}
                      </Text>
                    </Group>

                    {/* Access level */}
                    <Group gap="xs" align="center">
                      {getAccessIcon(post.pristup)}
                      <Badge color={getAccessColor(post.pristup)} variant="light">
                        {getAccessLabel(post.pristup)}
                      </Badge>
                      {post.pristup === "nivo" && post.tier_name && (
                        <Badge color="violet" variant="outline">
                          Nivo: {post.tier_name}
                        </Badge>
                      )}
                    </Group>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </Container>
      </div>
    </div>
  );
}