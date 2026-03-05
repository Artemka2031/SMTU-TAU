"use client";

import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { MainContent } from "@/components/MainContent";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setDirections, setActiveLab } from "@/store/slices/directionSlice";
import { labsConfig } from "@/lib/labsConfig";

export default function Home() {
  const dispatch = useAppDispatch();
  const { activeLab } = useAppSelector((state) => state.direction);

  useEffect(() => {
    // Загружаем статическую конфигурацию лабораторных
    dispatch(setDirections(labsConfig));

    // Устанавливаем первую лабораторную активной
    if (labsConfig.length > 0 && labsConfig[0].labs.length > 0) {
      dispatch(setActiveLab(labsConfig[0].labs[0].full));
    }
  }, [dispatch]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <Header />
      <div className="flex flex-1 min-h-0 min-w-0 flex-col overflow-hidden md:flex-row">
        <Sidebar />
        {activeLab && <MainContent />}
        {!activeLab && (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Загрузка...
          </div>
        )}
      </div>
    </div>
  );
}
