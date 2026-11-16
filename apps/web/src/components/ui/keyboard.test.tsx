import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { Modal } from "./Modal";
import { Tabs } from "./Tabs";
it("fecha com Escape e devolve foco ao acionador", async () => {
 function Example(){const [open,setOpen]=useState(false);return <><button onClick={()=>setOpen(true)}>Abrir</button><Modal title="Documento" open={open} onClose={()=>setOpen(false)}><input aria-label="Nome"/></Modal></>}
 const user=userEvent.setup();render(<Example/>);const trigger=screen.getByRole("button",{name:"Abrir"});await user.click(trigger);expect(screen.getByRole("dialog")).toHaveFocus();await user.keyboard("{Tab}");expect(screen.getByRole("button",{name:"Fechar"})).toHaveFocus();await user.keyboard("{Escape}");expect(screen.queryByRole("dialog")).not.toBeInTheDocument();expect(trigger).toHaveFocus();
});
it("navega pelas abas com setas e associa o painel",async()=>{
 function Example(){const [active,setActive]=useState("a");return <Tabs active={active} onChange={setActive} items={[{id:"a",label:"Histórico",content:"Primeiro"},{id:"b",label:"Providências",content:"Segundo"}]}/>}
 const user=userEvent.setup();render(<Example/>);await user.click(screen.getByRole("tab",{name:"Histórico"}));await user.keyboard("{ArrowRight}");const selected=screen.getByRole("tab",{name:"Providências"});expect(selected).toHaveFocus();expect(selected).toHaveAttribute("aria-selected","true");expect(screen.getByRole("tabpanel")).toHaveAttribute("aria-labelledby",selected.id);await user.keyboard("{Home}");expect(screen.getByRole("tab",{name:"Histórico"})).toHaveFocus();
});
