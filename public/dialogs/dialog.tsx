// TODO: 나중에 모듈로 분리하기

import Box from '@suid/material/Box';
import Fade from '@suid/material/Fade';
import Stack from '@suid/material/Stack';
import Typography from '@suid/material/Typography';
import { createComponent, createContext, createEffect, createSignal, For, JSX, useContext } from 'solid-js';

interface Response<ReturnType> {
    response: 'positive' | 'negative';
    returns?: ReturnType;
}

interface SmulogButtons {
    positive: () => JSX.Element;
    negative?: () => JSX.Element;
}

interface SmulogData<ReturnType, Props> {
    smulog: Smulog<ReturnType, Props>;
    option: SmulogOption;
    props: any;
}

interface SmulogOption {
    title?: string;
    cancelOnTouchOutside?: boolean;
}

interface SmulogContainerContext<ReturnType, Props> {
    add(dialog: SmulogData<ReturnType, Props>): void;
    dismiss(dialog: Smulog<any, any>): void;
}

interface SmulogContext<ReturnType> {
    setButtons(buttons: SmulogButtons): void;
    close(response: Response<ReturnType>): void;
    close(): void;
}

const SmulogContainerContext = createContext<SmulogContainerContext<any, any>>();
const SmulogContext = createContext<SmulogContext<any>>();

class Smulog<ReturnType, Props> {
    private _closeCall?: (response: Response<ReturnType>) => void;

    public get closeCall() {
        return this._closeCall;
    }

    public get component(): (props: Props) => JSX.Element {
        return this._component;
    }

    public constructor(private _component: (props: Props) => JSX.Element) {

    }

    async show(context: SmulogContainerContext<ReturnType, Props>, option: SmulogOption, props: Props): Promise<Response<ReturnType>> {
        context.add({
            smulog: this,
            option,
            props
        });

        return new Promise<Response<ReturnType>>((resolve) => {
            this._closeCall = response => {
                context.dismiss(this);
                resolve(response);
            };
        });
    }
}

export function SmulogContainer(props: { children: JSX.Element }) {
    const [smulogDataList, setSmulogDataList] = createSignal<Array<SmulogData<any, any>>>([]);

    const context: SmulogContainerContext<any, any> = {
        add(dialog: SmulogData<any, any>) {
            setSmulogDataList([...smulogDataList(), dialog]);
        },
        dismiss: (dialog: Smulog<any, any>) => {
            setSmulogDataList([...smulogDataList().filter(data => data.smulog !== dialog)]);
        }
    };

    return (
        <SmulogContainerContext.Provider
            value={context}>
            <>
                {props.children}
                <For each={smulogDataList()}>
                    {
                        data => {
                            const [buttons, setButtons] = createSignal<SmulogButtons>({
                                positive: () => <></>,
                            });

                            return createComponent(() => {
                                return (
                                    <Fade
                                        in={true}>
                                        <Stack
                                            sx={{
                                                position: 'fixed',
                                                width: '100%',
                                                height: '100%',
                                                backgroundColor: 'rgba(0, 0, 0, 0.5)', // TODO: 테마에서 가져오기
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                            <SmulogContext.Provider value={{
                                                close: (response?: Response<any>) => {
                                                    if (response === undefined) {
                                                        data.smulog.closeCall?.({
                                                            response: 'negative'
                                                        });
                                                    } else {
                                                        data.smulog.closeCall?.(response);
                                                    }
                                                },
                                                setButtons: (buttons: SmulogButtons) => {
                                                    setButtons(buttons);
                                                }
                                            }}>
                                                <Stack
                                                    sx={{
                                                        width: '540px',
                                                        height: 'auto',
                                                        maxWidth: '100%',
                                                        maxHeight: '80%',
                                                        bgcolor: 'background.default',
                                                        boxShadow: "0px 0px 32px rgba(0,0,0,0.2)",
                                                        borderRadius: 1
                                                    }}>

                                                    <Stack
                                                        sx={{
                                                            height: 'auto',
                                                            maxHeight: '100%',
                                                        }}
                                                        direction="column">
                                                        {
                                                            data.option.title &&
                                                            <Stack
                                                                sx={{
                                                                    padding: '0px 24px'
                                                                }}>

                                                                <Typography
                                                                    variant="h6"
                                                                    sx={{
                                                                        padding: '16px 0px'
                                                                    }}
                                                                >
                                                                    {data.option.title}
                                                                </Typography>

                                                            </Stack>
                                                        }

                                                        <Stack
                                                            sx={{
                                                                flex: 1,
                                                                height: '0px',
                                                                padding: '0px 24px'
                                                            }}>

                                                            {createComponent(data.smulog.component, data.props)}

                                                        </Stack>

                                                        <Stack
                                                            direction="row"
                                                            justifyContent="end"
                                                            spacing="8px"
                                                            sx={{
                                                                padding: '8px'
                                                            }}>
                                                            {
                                                                createComponent(buttons().negative ?? (() => <></>), {})
                                                            }
                                                            {
                                                                createComponent(buttons().positive, {})
                                                            }
                                                        </Stack>
                                                    </Stack>
                                                </Stack>
                                            </SmulogContext.Provider>
                                        </Stack>
                                    </Fade>
                                )

                            }, {})
                        }
                    }
                </For>
            </>
        </SmulogContainerContext.Provider>
    )
}

export function useDialogContainer() {
    const context = useContext(SmulogContainerContext);

    if (context === undefined) {
        throw new Error('Component must be used within a DialogContainer');
    }

    return context;
}

export function useDialog<ReturnType>(): SmulogContext<ReturnType> {
    const context = useContext(SmulogContext);

    if (context === undefined) {
        throw new Error('Component must be used within a Dialog');
    }

    return context;
}

export function createSmulog<ReturnType, Props>(Component: (props: Props) => JSX.Element): Smulog<ReturnType, Props> {
    return new Smulog<ReturnType, Props>(Component);
}
