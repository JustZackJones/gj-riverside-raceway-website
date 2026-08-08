'use client'
import React from 'react'
import { ContentWithIcon } from '@/components/ui/ui'
import { about } from '@/content/content'
import { facebook } from '@/content/content'

type SiteFaceBookMessageDisplay = {
    contentBefore?: string | React.JSX.Element;
    contentAfter?: string | React.JSX.Element;
    style?: React.CSSProperties;
    className?: string;
}
export function SiteFaceBookMessageDisplay({contentBefore, contentAfter, style, className}: SiteFaceBookMessageDisplay) {
    return (
        <ContentWithIcon icon="fa-brands fa-facebook-messenger" style={style} className={className}>{contentBefore}{facebook.primaryContactContent()}{contentAfter}</ContentWithIcon>
    )
}

type SiteFaceBookMessageDisplayForPracticeProps = {
    style?: React.CSSProperties;
    className?: string;
}

export function SiteFaceBookMessageDisplayForPractice({style, className}: SiteFaceBookMessageDisplayForPracticeProps) {
    return (
        <SiteFaceBookMessageDisplay contentBefore={"Message "} contentAfter={" for practice."} style={style} className={className} />
    )
}