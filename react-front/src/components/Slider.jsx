import React, { useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  ActionIcon,
  Box,
  Divider,
  Group,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import {
  IconHome,
  IconUsers,
  IconUser,
  IconUserPlus,
  IconList,
  IconLogout,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import api from "../api/api";
import RandomQuote from '../components/RandomQuote';
import { getAuth, clearAuth, getUserTip, getUserRole } from "../utils/auth";

const NAVY = "#0B1F3B";

function getMenuItems(tip, role) {
  // Zajedničke stavke
  const items = [];
  

  if (tip === "patron" && role !== "admin") {
    items.push(
      { label: "Početna", to: "/home-patron", icon: IconHome },
      { label: "Kreatori", to: "/creators", icon: IconUsers },
      { label: "Moje pretplate", to: "/my-subscriptions", icon: IconList }
    );
  } else if (tip === "kreator") {
    items.push(
      { label: "Početna", to: "/home-creator", icon: IconHome },
      { label: "Moji nivoi", to: "/my-tiers", icon: IconList },
      { label: "Moje objave", to: "/my-posts", icon: IconList }
    );
  } else if (tip === "oba") {
    items.push(
      { label: "Početna (patron)", to: "/home-patron", icon: IconHome },
      { label: "Kreatori", to: "/creators", icon: IconUsers },
      { label: "Moje pretplate", to: "/my-subscriptions", icon: IconList },
      { label: "Kreatorski panel", to: "/home-creator", icon: IconUserPlus },
      { label: "Moji nivoi", to: "/my-tiers", icon: IconList },
      { label: "Moje objave", to: "/my-posts", icon: IconList }
    );
  }

  // Admin opcije (ako je role = admin)
  if (role === "admin") {
    items.push(
      { label: "Admin panel", to: "/admin/stats", icon: IconUsers }
    );
  }

  return items;
}

export default function Slider() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const tip = getUserTip();
  const role = getUserRole();
  const menu = useMemo(() => getMenuItems(tip, role), [tip, role]);

  const auth = getAuth();
  const userName = auth?.user?.name || "Profil";

  const logout = async () => {
    try {
      await api.post("/logout");
    } catch (e) {
      // ignore
    } finally {
      clearAuth();
      navigate("/auth", { replace: true });
    }
  };

  return (
    <Box
      style={{
        width: collapsed ? 82 : 280,
        minWidth: collapsed ? 82 : 280,
        height: "100vh",
        position: "sticky",
        top: 0,
        padding: 14,
        background: "rgba(255,255,255,0.88)",
        borderRight: "1px solid rgba(11,31,59,0.12)",
        backdropFilter: "blur(10px)",
        transition: "width 180ms ease",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {/* Header sa logo i kolaps dugmetom */}
      <Group justify="space-between">
        <img
          src={collapsed ? "/logoSmall.png" : "/logo.png"}
          alt="Logo"
          style={{ width: collapsed ? 44 : 140, height: 44, objectFit: "contain" }}
        />
        <ActionIcon onClick={() => setCollapsed((v) => !v)} variant="light" radius="xl">
          {collapsed ? <IconChevronRight size={18} /> : <IconChevronLeft size={18} />}
        </ActionIcon>
      </Group>
      
      <Divider />

      <Stack gap={8} style={{ flex: 1 }}>
        {menu.map((item) => (
          <Tooltip key={item.to} label={collapsed ? item.label : ""} position="right" withArrow>
            <UnstyledButton
              component={NavLink}
              to={item.to}
              style={({ isActive }) => ({
                width: "100%",
                borderRadius: 14,
                padding: collapsed ? "12px 10px" : "10px 12px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: isActive ? "rgba(11,31,59,0.10)" : "transparent",
                border: isActive ? "1px solid rgba(11,31,59,0.14)" : "1px solid transparent",
              })}
            >
              <Box
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(11,31,59,0.06)",
                  border: "1px solid rgba(11,31,59,0.10)",
                }}
              >
                <item.icon size={18} color={NAVY} />
              </Box>
              {!collapsed && <Text fw={700}>{item.label}</Text>}
            </UnstyledButton>
          </Tooltip>
        ))}
      </Stack>

      {!collapsed && (
        <>
          <Divider />
          <div style={{ marginTop: 24 }}>
            <RandomQuote />
          </div>
          <Divider />
        </>
      )}

      <UnstyledButton
        component={NavLink}
        to="/my-profile"
        style={({ isActive }) => ({
          width: "100%",
          borderRadius: 14,
          padding: collapsed ? "12px 10px" : "10px 12px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: isActive ? "rgba(11,31,59,0.10)" : "transparent",
          border: isActive ? "1px solid rgba(11,31,59,0.14)" : "1px solid transparent",
          marginBottom: 12,
        })}
      >
        <Box
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            display: "grid",
            placeItems: "center",
            background: "rgba(11,31,59,0.06)",
            border: "1px solid rgba(11,31,59,0.10)",
          }}
        >
          <IconUser size={18} color={NAVY} />
        </Box>
        {!collapsed && <Text fw={700}>{userName}</Text>}
      </UnstyledButton>

      <UnstyledButton
        onClick={logout}
        style={{
          width: "100%",
          borderRadius: 14,
          padding: "12px 12px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "rgba(11,31,59,0.06)",
          border: "1px solid rgba(11,31,59,0.12)",
        }}
      >
        <Box
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            display: "grid",
            placeItems: "center",
            background: "rgba(11,31,59,0.08)",
          }}
        >
          <IconLogout size={18} color={NAVY} />
        </Box>
        {!collapsed && <Text fw={700}>Odjavi se</Text>}
      </UnstyledButton>
    </Box>
  );
}