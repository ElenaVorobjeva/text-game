import { useEffect, useState, type ReactNode } from "react";

import { Loader } from "../components/base/Loader";
import { fetchUserData, type UserData } from "../user/userProfile";

type Props = {
  children: (data: UserData) => ReactNode;
};

export function BootGate({ children }: Props) {
  const [data, setData] = useState<UserData | null>(null);

  useEffect(() => {
    let alive = true;
    fetchUserData().then((loaded) => {
      if (alive) setData(loaded);
    });

    return () => {
      alive = false;
    };
  }, []);

  if (!data) return <Loader />;
  return <>{children(data)}</>;
}
